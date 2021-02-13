import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import {
  Map as MapboxMap,
  Expression,
  NavigationControl, AttributionControl,
  EventData, MapMouseEvent,
  GeoJSONSource, MapboxGeoJSONFeature
} from 'mapbox-gl';

import { ToastrService } from 'ngx-toastr';
import { Subject, Observer } from 'rxjs';
import { takeUntil, tap, switchMapTo, filter, first } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';

import { GymPopupComponent } from '../gym-popup/gym-popup.component';

import { GymService } from '../services/gym.service';
import { MessageService } from '../services/message.service';

import { FilterControl } from '../filter/filter.control';
import { NewGymControl } from '../new-gym/new-gym.control';

import { PopupReturn, CustomError, FilterError } from '../model/shared.model';
import { GymProps, BadgeCollection, BadgeUpdate, CreatedGymData } from '../model/gym.model';
import { UserService } from '../services/user.service';
import { Role } from '../model/role.model';
import { FilterService } from '../services/filter.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  private map!: MapboxMap;
  private userBadges: BadgeCollection = {};
  private obv: Observer<PopupReturn | undefined>;

  /**
   * Stores all gym features for the gym source
   */
  private gyms: GeoJSON.FeatureCollection<GeoJSON.Point, GymProps>;

  /**
   * "Kill switch" for all active subscriptions
   */
  private unsubscribeAll$ = new Subject();

  constructor(
    private db: GymService,
    private us: UserService,
    private ms: MessageService,
    private fs: FilterService,
    private modal: MatDialog,
    private toast: ToastrService,
    private route: ActivatedRoute
  ) {
    this.gyms = { type: 'FeatureCollection', features: [] };
    this.userBadges = {};

    this.obv = {
      next: (ret) => {

        if (!ret) {
          return;
        }

        switch (ret.type) {

          case 'gymUpdateFailed':
            this.toast.error(`Couldn't update gym because: ${JSON.stringify(ret.data)}!`, 'Gym', { disableTimeOut: true });
            break;

          case 'badgeUpdateFailed':
            this.toast.error(`Couldn't update gym badge because: ${ret.data as string}!`, 'Gym', { disableTimeOut: true });
            break;

          case 'gymUpdate':

            const u = ret.data as GymProps & { lat: string | number, lng: string | number };
            const ix = this.gyms.features.findIndex(({ properties: { firestoreId: fid } }) => fid === u.firestoreId);

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

            const { firestoreId, newBadge } = ret.data as BadgeUpdate;

            this.userBadges[firestoreId] = newBadge;
            this.map.setLayoutProperty('gymsLayer', 'icon-image', this.gymIcon);
            break;

          default: break;
        }
      },
      error: (e: Error) => {
        this.toast.error(`Popup closed with error ${e.message}`, 'Popup', { disableTimeOut: true })
      },
      complete: () => {}
    }
  }

  ngOnInit(): void {

    // create map
    this.map = new MapboxMap({
      container: 'map',
      accessToken: environment.MAPBOX_API_TOKEN,
      style: 'mapbox://styles/mappinglehne/ck4n0h27q0qqe1crzvpg8vpsm',
      zoom: 13,
      center: [13.204929, 52.637736],
      maxZoom: 16,
      minZoom: 11,
      attributionControl: false,
    })
      .addControl(new NavigationControl(), 'top-right')
      .addControl(new FilterControl(), 'top-right')
      .addControl(new AttributionControl({
        compact: true,
        // eslint-disable-next-line max-len
        customAttribution: 'Icons by <a href="http://roundicons.com">Roundicons free</a>, <a href="http://theartificial.nl">The Artificial</a> and <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> &amp; <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a>'
      }))
      .on('load', this.onLoad.bind(this));

    this.us.hasRole(Role.ADMIN).pipe(first()).subscribe(isAdmin => {
      if (isAdmin) this.map.addControl(new NewGymControl(), 'top-right');
    });
  }

  ngOnDestroy(): void {

    // prevent subscriptions leaks by activating the "kill switch"
    // see https://stackoverflow.com/a/41177163
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  /**
   * Setup handlers after initial loading is done
   */
  private onLoad() {

    this.toast.info('Map loaded!', 'Map');

    this.map
      .addSource('gymSource', { type: 'geojson', data: this.gyms })
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
      .on('click', 'gymsLayer', this.onGymsClick.bind(this))

    this.loadData();
  }

  private setupListener() {

    // listen for messages
    this.ms.onMessage()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({

        next: (msg) => {

          // console.log(msg);

          switch (msg.type) {

            case 'newGym':

              const data = msg.data as CreatedGymData;

              const feature = data.gym;
              this.gyms.features.push(feature);
              (this.map.getSource('gymSource') as GeoJSONSource).setData(this.gyms);
              this.toast.success(`Added "${feature.properties.name}" as a new gym!`, 'Gym');

              this.userBadges[feature.properties.firestoreId] = data.badge;
              this.map.setLayoutProperty('gymsLayer', 'icon-image', this.gymIcon);
              break;

            default:
              this.toast.warning(`Couldn't handle type <${msg.type}>!`, 'Message');
              break;
          }
        },
        error: (e: CustomError) => {
          this.toast.error(e.err, `${e.type} error`, { disableTimeOut: true });
        }

      });

    // listen to filter changes
    this.fs.onChanged()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: ({ includeLegacy, badges, showGyms }) => {

          const data = [];

          if (!includeLegacy) {
            data.push(['!', ['has', 'isLegacy']]);
          }

          if (badges.length) {
            data.push(['match', ['coalesce', ['get', ['get', 'firestoreId'], ['literal', this.userBadges]], '0'], badges, true, false]);
          }
          const expression = data.length > 1 ? ['all', ...data] : (data.length === 1 ? data.flat() : undefined);

          this.map
            .setLayoutProperty('gymsLayer', 'visibility', showGyms ? 'visible' : 'none')
            .setFilter('gymsLayer', expression); // TODO(helene): add validate=false option
        },
        error: (e: FilterError) => {
          this.toast.error(`Couldn't apply filters because ${e.message}!`, 'Filter Error', { disableTimeOut: true });
        }
      });
  }

  private openModal(feature: GeoJSON.Feature) {

    const position = (feature.geometry as GeoJSON.Point).coordinates;

    this.map.easeTo({ center: position as [number, number] });

    const props = feature.properties as GymProps;
    const badge = this.userBadges[props.firestoreId] || 0;

    const ref: MatDialogRef<GymPopupComponent, PopupReturn> = this.modal.open(GymPopupComponent, {
      data: { ...props, position, badge },
      panelClass: 'custom-panel'
    });

    ref.afterClosed().subscribe(this.obv);
  }

  private onGymsClick(e: MapMouseEvent & EventData & { features?: MapboxGeoJSONFeature[] }) {

    if (!e.features) { return; }

    this.openModal(e.features[0]);
  }

  /**
   * Populates the gym and quest source with data from firestore
   */
  private loadData() {

    this.db.getGyms().pipe(
      tap((gymCollection) => {

        this.gyms = gymCollection;
        (this.map.getSource('gymSource') as GeoJSONSource).setData(this.gyms);
        this.toast.success('Gyms loaded', 'Data');

      }),
      switchMapTo(this.us.getMedals()),
      tap((badgeCollection) => {

        this.userBadges = badgeCollection;
        this.map.setLayoutProperty('gymsLayer', 'icon-image', this.gymIcon);
        this.toast.success('Badges loaded', 'Data');

        this.setupListener();

      }),
      switchMapTo(this.route.fragment),
      filter((fragOrEmpty: string | undefined): fragOrEmpty is string => !!fragOrEmpty),
      first()
    ).subscribe({
      next: (frag) => {

        const feat = this.gyms.features.find(({ properties: { firestoreId } }) => firestoreId === frag);
        if (!feat) return;

        this.openModal(feat);
      },
      error: (e: CustomError) => {
        this.toast.error(e.message, e.code, { disableTimeOut: true });
      }
    });
  }

  private get gymIcon(): Expression {
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
}
