import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';

import { environment } from '../../environments/environment';

import * as mapboxgl from 'mapbox-gl';
import { ToastrService } from 'ngx-toastr';

import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { PopupComponent } from '../popup/popup.component';

import { DbService } from '../services/db.service';
import { MessageService } from '../services/message.service';

import { FilterControl } from '../filter/filter.control';
import { NewGymControl } from '../new-gym/new-gym.control';
import { MapStyle } from '../model/shared.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  private map: mapboxgl.Map;

  private proms = [];

  gyms: GeoJSON.FeatureCollection<GeoJSON.Point> = null;
  quests: GeoJSON.FeatureCollection<GeoJSON.Point> = null;
  gymFilter = [];
  questFilter = [];
  private subs: Subscription[] = [];

  constructor(
    private swUpdate: SwUpdate,
    private db: DbService,
    private ms: MessageService,
    private modal: MatDialog,
    private toast: ToastrService
  ) {
    // workaround for https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23467
    Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set(environment.MAPBOX_API_TOKEN);

    // start downloading the data early
    this.proms.push(this.db.getGyms(), this.db.getQuests());
  }

  ngOnInit() {

    // watch for service worker updates
    if (this.swUpdate.isEnabled) {
      console.log('update handler...');
      this.swUpdate.available.subscribe(() => {
        this.toast.info('Click to reload!', 'App Update', {
          disableTimeOut: true
        })
          .onTap
          .pipe(take(1))
          .subscribe(() => window.location.reload());
      });
    }

    this.map = new mapboxgl.Map({
      container: 'map',
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
      .on('click', this.onClick.bind(this))
      .on('styleimagemissing', this.onStyleImageMissing.bind(this))
      .on('load', () => {

        this.toast.success('Map loaded!', 'Map');
        this.loadData();

      });
  }

  private onClick(e: mapboxgl.MapMouseEvent & mapboxgl.EventData) {

    const features = this.map.queryRenderedFeatures(e.point, {

      layers: ['gymsLayer', 'questsLayer']
      // validate: false
    });

    if (!features.length) { return; }

    // @ts-ignore: Attribute 'coordinates' does exist, but Typescript cant find it?
    this.map.easeTo({ center: features[0].geometry.coordinates });

    const props = features[0].properties;
    const ref = this.modal.open(PopupComponent, {
      data: props

    });

    // afterClosed() auto-completes itself, so unsubscribing is not needed
    ref.afterClosed().subscribe(ret => {

      if (ret && ret.hasOwnProperty('error')) {

        this.toast.error(`Couldn't update gym because: ${ret.error}!`, 'Gym');

      } else if (ret && ret.hasOwnProperty('badgeUpdate')) {

        for (let i = this.gyms.features.length; i--;) {
          if (this.gyms.features[i].properties.fid === ret.fid) {
            this.gyms.features[i].properties.badge = ret.badgeUpdate;
            break;
          }
        }

        (this.map.getSource('gyms') as mapboxgl.GeoJSONSource).setData(this.gyms);
      }

      // TODO(helene): Handle updates for quest layer with feature state.
    });


  }

  // TODO(helene): Create an own mapbox style that already contains the main icons
  // like gym badges and maybe the quest rewards?
  private async onStyleImageMissing(e: any) { 

    const id = e.id;
    await new Promise(resolve => {

      this.map.loadImage(`../assets/quests/${id}.png`, (err: Error, img: ImageData) => {

        if (err) {
          console.log(err.message);
        } else {
          if (!this.map.hasImage(id)) {
            this.map.addImage(id, img);
          }
        }
        resolve();
      });
    });
  }

  private loadAndAddImages(): Promise<string>[] {

    const imgs = ['gyms/badge0', 'gyms/badge1', 'gyms/badge2', 'gyms/badge3', 'gyms/badge4'];

    return imgs.map(path => {
      return new Promise((resolve, reject) => {
        this.map.loadImage(`../assets/${path}.png`, (err: Error, img: ImageData) => {

          if (err) {
            reject(err.message);
          } else {

            const name = path.split('/').pop();

            this.map.addImage(name, img);
            resolve(name);
          }
        });
      });
    });
  }

  private async loadData() {

    try {

      // TODO(helene): Refactor to use observables everywhere
      [this.gyms, this.quests, ] = await Promise.all([...this.proms, ...this.loadAndAddImages()]);

      this.map
        .addSource('gyms', {
          type: 'geojson',
          data: this.gyms
        })
        .addSource('quests', {
          type: 'geojson',
          data: this.quests
        })
        .addLayer({
          id: 'gymsLayer',
          type: 'symbol',
          source: 'gyms',
          layout: {
            'icon-image': 'badge{badge}',
            'icon-size': 0.5,
            'icon-allow-overlap': true
          },
          minzoom: 10,
          maxzoom: 21
        })
        .addLayer({
          id: 'questsLayer',
          type: 'symbol',
          source: 'quests',
          layout: {
            // TODO(helene): Handle quests with multiple rewards with question mark icon?
            'icon-image': ['case', ['==', '#', ['get', 'reward']], ['get', 'encounter'], ['get', 'reward']],
            'icon-size': 0.5,
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
        .on('mousemove', 'gymsLayer', () => this.map.getCanvas().style.cursor = 'pointer')
        .on('mouseleave', 'gymsLayer', () => this.map.getCanvas().style.cursor = '');

      const sub = this.ms.onMessage().subscribe({

        next: (f) => {

          switch (f.type) {

            case 'newGym':
              this.gyms.features.push(f.data);
              (this.map.getSource('gyms') as mapboxgl.GeoJSONSource).setData(this.gyms);
              this.toast.success(`Added "${f.data.properties.desc}" as a new gym!`, `Gym`);
              break;

            case 'filtersChanged':
              this.map
                .setLayoutProperty('questsLayer', 'visibility', f.data.showQuests ? 'visible' : 'none')
                .setLayoutProperty('gymsLayer', 'visibility', f.data.showGyms ? 'visible' : 'none')
                .setFilter('questsLayer', f.data.quests ? f.data.quests : null)
                .setFilter('gymsLayer', f.data.gyms ? f.data.gyms : null);
              break;

            default:
              this.toast.warning(`Couldn't handle type <${f.type}>!`, `Message`);
              break;
          }
        },
        error: (e) => {
          this.toast.error(e.err, `${e.type} error`);
        }

      });

      this.subs.push(sub);

    } catch (err) {
      this.toast.error(`${err.message}`, 'Map error');
    }
  }

  /**
   * Returns the mapbox style URI based on the 
   * style value in localStorage. 
   * 
   * Default style is 'Auto', which switches between
   * 'Dark' and 'Outdoors' based on the current time.
   */
  private getStyle() {
    const s: string = localStorage.getItem('mapStyle') || 'Auto';

    return `mapbox://styles/mapbox/${s !== 'Auto' ? MapStyle[s] : (h => (h < 6 || h > 21) ? 'dark-v10' : 'outdoors-v11')((new Date()).getHours())}`;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

}
