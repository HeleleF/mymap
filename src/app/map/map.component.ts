import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v9';

  ngOnInit() {

    // workaround for https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23467
    Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set(environment.MAPBOX_API_TOKEN);

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
  }

}
