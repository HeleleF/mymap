import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';

import { ToastrService } from 'ngx-toastr';

import { SwUpdate } from '@angular/service-worker';
import { take } from 'rxjs/operators';

import { DbService } from '../shared/db.service';

import { PopupComponent } from '../popup/popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: mapboxgl.Map;

  proms: Promise<any>[] = [];

  /**
   * wird über die settings verändert; enthält alle momentan sichtbaren layer
   */
  usedLayers: string[] = [];

  constructor(private swUpdate: SwUpdate,
    private db: DbService,
    private modal: MatDialog,
    private toast: ToastrService) {
    // workaround for https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23467
    Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set(environment.MAPBOX_API_TOKEN);
  }

  ngOnInit() {

    // watch for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.toast.info('Click to reload!', 'App Update', {
          disableTimeOut: true
        })
          .onTap
          .pipe(take(1))
          .subscribe(() => window.location.reload());
      });
    }

    this.proms.push(this.db.getGymsAsGeoJSON2(), this.db.getQuestsAsGeoJSON2());
    console.log('started loading');

    this.map = new mapboxgl.Map({
      container: 'map',
      style: `mapbox://styles/mapbox/${(h => { return (h < 6 || h > 21) ? "dark-v10" : "outdoors-v11" })((new Date).getHours())}`,
      zoom: 13,
      center: [13.204929, 52.637736],
      maxBounds: [[13.011440, 52.379703], [13.786092, 52.784571]],
      maxZoom: 16,
      minZoom: 9
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('click', this.clickHandler.bind(this));
    this.map.on('styleimagemissing', this.styleHandler.bind(this));

    console.log('waiting for map...');

    this.map.on('load', () => {

      this.toast.success('Map loaded!', 'Map');

      this.loadData();

    });
  }

  private clickHandler(e: mapboxgl.MapMouseEvent & mapboxgl.EventData) {

    const features = this.map.queryRenderedFeatures(e.point, {
      layers: this.usedLayers
    });

    if (features.length) {

      // @ts-ignore: Attribute 'coordinates' does exist, but Typescript cant find it?
      this.map.flyTo({ center: features[0].geometry.coordinates });

      const ref = this.modal.open(PopupComponent, {
        width: '300px',
        data: features[0].properties

      });

      ref.afterClosed().subscribe(d => {
        console.log(d);
      });

    }
  }

  private async styleHandler(e: any) {

    const id = e.id;

    console.log('missing ', e, id);
  };

  private loadAndAddImages() {

    const imgs = ['gyms/badge0', 'gyms/badge1', 'gyms/badge2', 'gyms/badge3', 'gyms/badge4'];

    return imgs.map(path => {
      return new Promise((res, rej) => {
        this.map.loadImage(`../assets/${path}.png`, (err: Error, img: ImageData) => {

          if (err) {
            rej(err.message);
          } else {
  
            const name = path.split('/').pop();
  
            this.map.addImage(name, img);
            res(name);
          }
        });
      });
    });
  }

  private async loadData() {

    try {

      const [gyms, quests, ] = await Promise.all([...this.proms, ...this.loadAndAddImages()]);

      //@ts-ignore
      window.g = gyms;
      //@ts-ignore
      window.q = quests;

      this.map.addSource("gyms", {
        type: "geojson",
        data: gyms
      });
      this.map.addSource("quests", {
        type: "geojson",
        data: quests
      });
      console.log('sources added');
  
      this.map.addLayer({
        id: 'gymsLayer',
        type: "symbol",
        source: "gyms",
        layout: {
          'icon-image': ['concat', 'badge', ['get', 'badge']],
          'icon-size': 0.5
        },
      });
      this.map.addLayer({
        id: 'questsLayer',
        type: "symbol",
        source: "quests",
        layout: {
          'icon-image': ['get', 'status'], //????
          'icon-size': 0.5
        }
      });
      console.log('layers added');
  
      this.usedLayers.push('gymsLayer');
      this.usedLayers.push('questsLayer');

    } catch (err) {
      this.toast.error(`${err.message}`, 'Map error');
    }

    /*
    this.db.getGymsAsGeoJSON().subscribe(gyms => {

            //@ts-ignore
            window.g = gyms;

      this.map.addSource("gyms", {
        type: "geojson",
        data: gyms
      });

      this.map.addLayer({
        id: 'gymsLayer',
        type: "symbol",
        source: "gyms",
        layout: {
          'icon-image': ['concat', 'badge', ['get', 'badge']],
          'icon-size': 0.5
        },
      });
      this.usedLayers.push('gymsLayer');


    },
      err => {
        this.toast.error(`${err.message}`, 'Gym error');
      });

    this.db.getStopsAsGeoJSON().subscribe(stops => {
      console.log(stops);
    },
      err => {
        this.toast.error(`${err.message}`, 'Stop error');
      });

    this.db.getQuestsAsGeoJSON().subscribe(quests => {

      //@ts-ignore
      window.q = quests;

      this.map.addSource("quests", {
        type: "geojson",
        data: quests
      });

      this.map.addLayer({
        id: 'questsLayer',
        type: "symbol",
        source: "quests",
        layout: {
          'icon-image': ['get', 'status'], //????
          'icon-size': 0.5
        }
      });
      this.usedLayers.push('questsLayer');
    },
      err => {
        this.toast.error(`${err.message}`, 'Quest error');
      });
      */
  }

}
