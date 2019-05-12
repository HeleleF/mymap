import { Component, OnInit } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v9';

  ngOnInit() {

    // workaround for https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23467
    Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set('pk.eyJ1IjoibWFwcGluZ2xlaG5lIiwiYSI6ImNqdmxhZzMyYjEwNXAzeWw2ZTZqcG5waWUifQ.PtU676kvusvROvh_N34FxA');

    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [13.204929, 52.637736],
      maxBounds: [[13.011440, 52.379703], [13.786092, 52.784571]]
    });

    this.map.addControl(new mapboxgl.NavigationControl());
  }
}
