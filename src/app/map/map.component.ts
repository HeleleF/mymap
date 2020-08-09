import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';

import { environment } from '../../environments/environment';

import * as mapboxgl from 'mapbox-gl';
import { ToastrService } from 'ngx-toastr';

import { Subject, Observer, zip } from 'rxjs';
import { take, takeUntil, tap, switchMapTo, filter } from 'rxjs/operators';

import { GymPopupComponent } from '../gym-popup/gym-popup.component';

import { GymService } from '../services/gym.service';
import { MessageService } from '../services/message.service';

import { FilterControl } from '../filter/filter.control';
import { NewGymControl } from '../new-gym/new-gym.control';

import { PopupReturn } from '../model/shared.model';
import { GymProps, BadgeCollection, GymBadge } from '../model/gym.model';
import { QuestProps } from '../model/quest.model';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  private map!: mapboxgl.Map;

  private userBadges: BadgeCollection = {};

  private obv: Observer<PopupReturn | undefined>;

  /**
   * Stores all gym features for the gym source
   */
  private gyms: GeoJSON.FeatureCollection<GeoJSON.Point, GymProps>;
  /**
   * Stores all quest features for the quest source
   */
  //private quests: GeoJSON.FeatureCollection<GeoJSON.Point, QuestProps>;

  /**
   * "Kill switch" for all active subscriptions
   */
  private unsubscribeAll$ = new Subject();

  constructor(
    private swUpdate: SwUpdate,
    private db: GymService,
    private us: UserService,
    private ms: MessageService,
    private modal: MatDialog,
    private toast: ToastrService,
    private route: ActivatedRoute
  ) {
    this.gyms = { type: 'FeatureCollection', features: [] };
    //this.quests = { type: 'FeatureCollection', features: [] };

    this.userBadges = {};

    this.obv = {
      next: (ret) => {

        if (!ret) {
          return;
        }

        switch (ret.type) {

          case 'gymUpdateFailed':
            this.toast.error(`Couldn't update gym because: ${ret.data}!`, 'Gym', { disableTimeOut: true });
            break;

          case 'badgeUpdateFailed':
            this.toast.error(`Couldn't update gym badge because: ${ret.data}!`, 'Gym', { disableTimeOut: true });
            break;

          case 'gymUpdate':

            const u = ret.data as GymProps & { lat: string | number, lng: string | number };
            const ix = this.gyms.features.findIndex(({ properties: { firestoreId } }) => firestoreId === u.firestoreId);

            if (ix === -1) {

              this.toast.error(`Couldn't update gym "${u.name}" because it doesn't exist in this layer!`, 'Gym', { disableTimeOut: true });

            } else {

              // only update stuff that changed
              if (u.name) this.gyms.features[ix].properties.name = u.name;
              if (u.imageUrl) this.gyms.features[ix].properties.imageUrl = u.imageUrl;
              if (u.isLegacy) this.gyms.features[ix].properties.isLegacy = true;
              if (u.lat && u.lng) this.gyms.features[ix].geometry.coordinates = [ +u.lng, +u.lat ];

              (this.map.getSource('gymSource') as mapboxgl.GeoJSONSource).setData(this.gyms);
            }

            break;

          case 'badgeUpdate':

            const { firestoreId, newBadge } = ret.data;

            this.userBadges[firestoreId] = newBadge;
            this.map.setLayoutProperty('gymsLayer', 'icon-image', this.gymIcon);
            break;

          default: break;
        }
      },
      error: (e) => {
        this.toast.error(`Popup closed with error ${e.message}`, 'Popup', { disableTimeOut: true })
      },
      complete: () => {}
    }
  }

  ngOnInit() {

    // watch for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.toast.info('Click to reload!', 'App Update', {
          disableTimeOut: true,
        })
          .onTap
          .pipe(take(1))
          .subscribe(() => this.swUpdate.activateUpdate().then(() => document.location.reload()));
      });
    }

    // create map
    this.map = new mapboxgl.Map({
      container: 'map',
      accessToken: environment.MAPBOX_API_TOKEN,
      style: 'mapbox://styles/mappinglehne/ck4n0h27q0qqe1crzvpg8vpsm',
      zoom: 13,
      center: [13.204929, 52.637736],
      maxZoom: 16,
      minZoom: 11,
      attributionControl: false,
    })
      .addControl(new mapboxgl.NavigationControl(), 'top-right')
      .addControl(new FilterControl(), 'top-right')
      .addControl(new NewGymControl(), 'top-right')
      .addControl(new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: 'Icons by <a href="http://roundicons.com">Roundicons free</a>, <a href="http://theartificial.nl">The Artificial</a> and <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> &amp; <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a>'
      }))
      .on('load', this.onLoad.bind(this));
  }

  /**
   * Setup handlers after initial loading is done
   */
  private onLoad() {

    this.toast.info('Map loaded!', 'Map');

    this.map
      .addSource('gymSource', { type: 'geojson', data: this.gyms })
      //.addSource('questSource', { type: 'geojson', data: this.quests })
      .addLayer({
        id: 'gymsLayer',
        type: 'symbol',
        source: 'gymSource',
        layout: {
          'icon-image': this.gymIcon,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 12, 0.2, 19, 0.5],
          'icon-allow-overlap': true,
        },
        minzoom: 10,
        maxzoom: 21
      })
      /*
      .addLayer({
        id: 'questsLayer',
        type: 'symbol',
        source: 'questSource',
        layout: {
          // TODO(helene): Handle quests with multiple rewards with question mark icon?
          'icon-image': ['case', ['==', '#', ['get', 'reward']], ['get', 'encounter'], ['get', 'reward']],
          'icon-size': 1,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'text-field': ['case', ['has', 'quantity'], ['get', 'quantity'], ''],
          'text-offset': [1.5, -1.5],
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        minzoom: 12,
        maxzoom: 21
      })
      */
      .on('click', 'gymsLayer', this.onGymsClick.bind(this))
      //.on('click', 'questsLayer', this.onQuestsClick.bind(this))

    this.loadData();

    // listen for messages
    this.ms.onMessage()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({

        next: (msg) => {

          console.log(msg);

          switch (msg.type) {

            case 'newGym':
              const feature = msg.data.f as GeoJSON.Feature<GeoJSON.Point, GymProps>;
              this.gyms.features.push(feature);
              (this.map.getSource('gymSource') as mapboxgl.GeoJSONSource).setData(this.gyms);
              this.toast.success(`Added "${feature.properties.name}" as a new gym!`, `Gym`);

              this.userBadges[feature.properties.firestoreId] = msg.data.b;
              this.map.setLayoutProperty('gymsLayer', 'icon-image', this.gymIcon);
              break;

            default:
              this.toast.warning(`Couldn't handle type <${msg.type}>!`, `Message`);
              break;
          }
        },
        error: (e) => {
          console.debug('[ON MESSAGE]', e);
          this.toast.error(e.err, `${e.type} error`, { disableTimeOut: true });
        }

      });

    // listen to filter changes
    /*
    this.fs.onChanged()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (filters) => {

          console.log(`Quest filter is ${JSON.stringify(filters.quests)}`);

          this.map
            .setLayoutProperty('questsLayer', 'visibility', filters.showQuests ? 'visible' : 'none')
            .setLayoutProperty('gymsLayer', 'visibility', filters.showGyms ? 'visible' : 'none')
            .setFilter('questsLayer', filters.quests)
            .setFilter('gymsLayer', filters.gyms);
        },
        error: (e) => {
          this.toast.error(`Couldn't apply filters because ${e.message}!`, 'Filter Error', { disableTimeOut: true });
        }
      });
      */
  }

  private onGymsClick(e: mapboxgl.MapMouseEvent & mapboxgl.EventData & { features?: mapboxgl.MapboxGeoJSONFeature[] }) {

    if (!e.features) { return; }

    const position = (e.features[0].geometry as GeoJSON.Point).coordinates;

    this.map.easeTo({ center: position as [number, number] });

    const props = e.features[0].properties as GymProps;
    const badge = this.userBadges[props.firestoreId] || 0;

    const ref: MatDialogRef<GymPopupComponent, PopupReturn> = this.modal.open(GymPopupComponent, {
      data: { ...props, position, badge },
      panelClass: 'custom-panel'
    });

    ref.afterClosed().subscribe(this.obv);
  }

  /*
  private onQuestsClick(e: mapboxgl.MapMouseEvent & mapboxgl.EventData & { features?: mapboxgl.MapboxGeoJSONFeature[] }) {

    if (!e.features) { return; }

    const loc = (e.features[0].geometry as GeoJSON.Point).coordinates;

    this.map.easeTo({ center: loc as [number, number] });

    const ref: MatDialogRef<QuestPopupComponent, PopupReturn> = this.modal.open(QuestPopupComponent, {
      data: e.features[0].properties as QuestProps
    });

    ref.afterClosed().subscribe({
      next: (ret) => {
        console.log(ret);
      }
    });
  }
  */

  /**
   * Populates the gym and quest source with data from firestore
   */
  private loadData() {

    this.db.getGyms().pipe(
      tap((gymCollection) => {

        this.gyms = gymCollection;
        (this.map.getSource('gymSource') as mapboxgl.GeoJSONSource).setData(this.gyms);
        this.toast.success('Gyms loaded', 'Data');
        (window as any).__GYMS__ = gymCollection.features; // only for debug

      }),
      switchMapTo(this.us.getMedals()),
      tap((badgeCollection) => {

        this.userBadges = badgeCollection;
        this.map.setLayoutProperty('gymsLayer', 'icon-image', this.gymIcon);
        this.toast.success('Badges loaded', 'Data');

      }),
      switchMapTo(this.route.fragment),
      filter((fragOrEmpty: string | undefined): fragOrEmpty is string => !!fragOrEmpty)
    ).subscribe({
      next: (frag) => {

        const feat = this.gyms.features.find(({ properties: { firestoreId } }) => firestoreId === frag);
        if (!feat) return;

        const props = feat.properties;

        const position = feat.geometry.coordinates;
        this.map.easeTo({ center: position as [number, number] });

        const badge = this.userBadges[frag] || 0;

        const ref: MatDialogRef<GymPopupComponent, PopupReturn> = this.modal.open(GymPopupComponent, {
          data: { ...props, position, badge },
          panelClass: 'custom-panel'
        });
    
        ref.afterClosed().subscribe(this.obv);

      },
      error: (e) => {
        this.toast.error(e.message, e.code, { disableTimeOut: true });
      }
    });
  }

  private get gymIcon(): mapboxgl.Expression {
    return ['concat', // concatenate the following two strings
              'badge', // string literal
              ['coalesce', // return the first of the following expressions that evaluates to non-null
                  ['get', // retrieve given field from given object
                      ['get', 'firestoreId'], // retrieve given field from the feature.properties object
                      ['literal', this.userBadges] // object literal
                  ],
                  '0' // string literal, "fallback" value
              ],
    ]
  }

  ngOnDestroy() {

    // prevent subscriptions leaks by activating the "kill switch"
    // see https://stackoverflow.com/a/41177163
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
