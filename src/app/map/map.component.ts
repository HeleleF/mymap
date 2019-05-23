import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';

import { ToastrService } from 'ngx-toastr';

import { SwUpdate } from '@angular/service-worker';
import { take } from 'rxjs/operators';

import { ApiService } from '../shared/api.service';
import { DbService } from '../shared/db.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v9';

  constructor(private swUpdate: SwUpdate,
    private db: DbService,
    private api: ApiService,
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

    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [13.204929, 52.637736],
      maxBounds: [[13.011440, 52.379703], [13.786092, 52.784571]],
      maxZoom: 16,
      minZoom: 9
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {

      this.toast.success('Map loaded!', 'Map');

      this.loadData();

      this.addMapHandler();

      console.log('done');
    });
  }

  private addMapHandler() {

    this.map.on('click', e => {

      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ['gymbadge0','gymbadge1','gymbadge2','gymbadge3','gymbadge4']
      });

      if (features.length) {

        // @ts-ignore: Attribute 'coordinates' does exist, but Typescript cant find it?
        this.map.flyTo({ center: features[0].geometry.coordinates });
        const {name: n, url: u, desc: d} = features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<h3 class="gym-name">${n}</h3><p class="gym-description">${d}</p><img class="gym-preview-img" src="http://${u}"/>`)
          .addTo(this.map);
      }
    });
  }

  private loadAndAddImages() {

    const imgs = ['gyms/badge0', 'gyms/badge1', 'gyms/badge2', 'gyms/badge3', 'gyms/badge4'];

    return Promise.all(imgs.map(i => this.addImage(i)));
  }

  private addImage(path: string): Promise<string> {

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
  }

  private createGymLayers(gyms: ApiModel.GymInfo[]): mapboxgl.Layer[] {

    let layers: mapboxgl.Layer[] = [{
      id: "gymbadge0",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      layout: {
        "icon-image": "badge0",
        "icon-size": 0.25
      }
    }, {
      id: "gymbadge1",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      layout: {
        "icon-image": "badge1",
        "icon-size": 0.25
      }
    }, {
      id: "gymbadge2",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      layout: {
        "icon-image": "badge2",
        "icon-size": 0.25
      }
    }, {
      id: "gymbadge3",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      layout: {
        "icon-image": "badge3",
        "icon-size": 0.25
      }
    }, {
      id: "gymbadge4",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      },
      layout: {
        "icon-image": "badge4",
        "icon-size": 0.25
      }
    }];

    gyms.forEach(g => {
      // @ts-ignore: Attribute 'data' does exist, but Typescript cant find it?
      layers[g.badge].source.data.features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [g.longitude, g.latitude],
        },
        properties: {
            name: g.name,
            id: g.id,
            url: g.imageUrl,
            desc: g.description
        }
      })
    });

    return layers;
  }

  private async loadData() {

    const imgs = await this.loadAndAddImages();

    console.log(imgs);

    this.api.getGyms().subscribe(gyms => {

      const layers = this.createGymLayers(gyms);

      layers.forEach(l => {
        this.map.addLayer(l);
      });
    },
      err => {
        this.toast.error(`Failed because ${err.message}`, 'Gym error');
      });

    this.api.getStops().subscribe(stops => {
      console.log(stops);
    },
      err => {
        this.toast.error(`Failed because ${err.message}`, 'Stop error');
      });
  }

}
