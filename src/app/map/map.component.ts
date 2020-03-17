import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';

import { environment } from '../../environments/environment';

import * as mapboxgl from 'mapbox-gl';
import { ToastrService } from 'ngx-toastr';

import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { PopupComponent } from '../popup/popup.component';

import { DbService } from '../services/db.service';
import { MessageService } from '../services/message.service';

import { FilterControl } from '../filter/filter.control';
import { NewGymControl } from '../new-gym/new-gym.control';

import { MapStyle, PopupReturn } from '../model/shared.model';
import { GymProps } from '../model/gym.model';
import { QuestProps } from '../model/quest.model';
import { FilterService } from '../services/filter.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  private map!: mapboxgl.Map;

  /**
   * Stores all gym features for the gym source
   */
  private gyms: GeoJSON.FeatureCollection<GeoJSON.Point, GymProps>;
  /**
   * Stores all quest features for the quest source
   */
  private quests: GeoJSON.FeatureCollection<GeoJSON.Point, QuestProps>;

  /**
   * "Kill switch" for all active subscriptions
   */
  private unsubscribeAll$ = new Subject();

  constructor(
    private swUpdate: SwUpdate,
    private db: DbService,
    private ms: MessageService,
    private fs: FilterService,
    private modal: MatDialog,
    private toast: ToastrService
  ) {
    this.gyms = { type: 'FeatureCollection', features: [] };
    this.quests = { type: 'FeatureCollection', features: [] };
  }

  ngOnInit() {

    // watch for service worker updates
    if (this.swUpdate.isEnabled) {
      console.debug('update handler...');
      this.swUpdate.available.subscribe(() => {
        this.toast.info('Click to reload!', 'App Update', {
          disableTimeOut: true
        })
          .onTap
          .pipe(take(1))
          .subscribe(() => window.location.reload());
      });
    }

    // create map
    this.map = new mapboxgl.Map({
      container: 'map',
      accessToken: environment.MAPBOX_API_TOKEN,
      style: this.getStyle(),
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
      .addSource('questSource', { type: 'geojson', data: this.quests })
      .addLayer({
        id: 'gymsLayer',
        type: 'symbol',
        source: 'gymSource',
        layout: {
          'icon-image': 'badge{badge}',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 12, 0.3, 19, 0.5],
          'icon-allow-overlap': true,
          'text-field': ['case', ['has', 'isLegacy'], '*', ''],
          'text-offset': [1.5, -1.5], // TODO(helene): use zoom expression to keep text near icon
        },
        minzoom: 10,
        maxzoom: 21
      })
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
      .on('click', this.onClick.bind(this))
      .on('styleimagemissing', this.onStyleImageMissing.bind(this))

    this.loadData();

    // listen for messages
    this.ms.onMessage()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({

        next: (msg) => {

          switch (msg.type) {

            case 'newGym':
              const feature = msg.data as GeoJSON.Feature<GeoJSON.Point, GymProps>;
              this.gyms.features.push(feature);
              (this.map.getSource('gymSource') as mapboxgl.GeoJSONSource).setData(this.gyms);
              this.toast.success(`Added "${feature.properties.name}" as a new gym!`, `Gym`);
              console.debug('newgym');
              break;

            case 'selectGym':

              const gym = msg.data as GeoJSON.Feature<GeoJSON.Point, GymProps>;

              this.map.easeTo({ center: gym.geometry.coordinates as [number, number] });
              console.debug('selectgym');
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
  }

  /**
   * Handles click events for the map
   */
  private onClick(e: mapboxgl.MapMouseEvent & mapboxgl.EventData) {

    const features = this.map.queryRenderedFeatures(e.point, {
      layers: ['gymsLayer', 'questsLayer'],
      validate: false
    });

    if (!features.length) { return; }

    const loc = (features[0].geometry as GeoJSON.Point).coordinates;

    this.map.easeTo({ center: loc as [number, number] });

    const props = features[0].properties as GymProps | QuestProps;
    const ref: MatDialogRef<PopupComponent, PopupReturn> = this.modal.open(PopupComponent, {
      data: { ...props, pos: loc }
    });

    ref.afterClosed().subscribe({
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

            const u = ret.data as GymProps;
            const ix = this.gyms.features.findIndex(({ properties: { firestoreId } }) => firestoreId === u.firestoreId);

            if (ix === -1) {

              this.toast.error(`Couldn't update gym "${u.name}" because it doesn't exist in this layer!`, 'Gym', { disableTimeOut: true });

            } else {

              this.gyms.features[ix].properties = u;
              (this.map.getSource('gymSource') as mapboxgl.GeoJSONSource).setData(this.gyms);
            }

            break;

          case 'badgeUpdate':

            const g = ret.data as GymProps;

            const idx = this.gyms.features.findIndex(({ properties: { firestoreId } }) => firestoreId === g.firestoreId);

            if (idx === -1) {

              this.toast.error(`Couldn't update badge for gym "${g.name}" because it doesn't exist in this layer!`, 'Gym', { disableTimeOut: true });

            } else {

              this.gyms.features[idx].properties.badge = g.badge;
              (this.map.getSource('gymSource') as mapboxgl.GeoJSONSource).setData(this.gyms);
            }

            break;

          case 'questUpdate':
            // TODO(helene): Handle updates for quest layer with feature state.
            break;

          default: break;
        }
      },
      error: (e) => {
        this.toast.error(`Popup closed with error ${e.message}`, 'Popup', { disableTimeOut: true })
      }
    });
  }

  /**
   * Handles missing icons for this map style
   */
  private onStyleImageMissing(e: any) {

    const id = e.id;
    console.debug(id);
    return new Promise(resolve => {

      this.map.loadImage(`../assets/quests/${id}.png`, (err: Error, img: ImageData) => {

        if (err) {
          console.debug(err.message);
        } else {
          if (!this.map.hasImage(id)) {
            this.map.addImage(id, img);
          }
        }
        resolve();
      });
    });
  }

  /**
   * Populates the gym and quest source with data from firestore
   */
  private loadData() {

    this.db.getGyms().pipe(takeUntil(this.unsubscribeAll$)).subscribe({

      next: (gymCollection) => {
        this.gyms = gymCollection;
        (this.map.getSource('gymSource') as mapboxgl.GeoJSONSource).setData(this.gyms);
        this.toast.success('Gyms loaded', 'Data');
      },

      error: (e) => {
        this.toast.error(e.message, `Gym error`, { disableTimeOut: true });
      }
    });

    this.db.getQuests().pipe(takeUntil(this.unsubscribeAll$)).subscribe({

      next: (questCollection) => {
        this.quests = questCollection;
        (this.map.getSource('questSource') as mapboxgl.GeoJSONSource).setData(this.quests);
        this.toast.success('Quests loaded', 'Data');
      },

      error: (e) => {
        this.toast.error(e.message, `Quest error`, { disableTimeOut: true });
      }
    });
  }

  /**
   * Returns the mapbox style URI based on the 
   * style value in localStorage. 
   * 
   * Default style is 'Auto', which switches between
   * 'Dark' and 'Outdoors' based on the current time.
   */
  private getStyle() {
    // const s = (localStorage.getItem('mapStyle') || 'Auto') as keyof typeof MapStyle | 'Auto';

    // return `mapbox://styles/mapbox/${s !== 'Auto' ? MapStyle[s] : (h => (h < 6 || h > 21) ? 'dark-v10' : 'outdoors-v11')((new Date()).getHours())}`;

    return 'mapbox://styles/mappinglehne/ck4n0h27q0qqe1crzvpg8vpsm';
  }

  ngOnDestroy() {

    // prevent subscriptions leaks by activating the "kill switch"
    // see https://stackoverflow.com/a/41177163
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
