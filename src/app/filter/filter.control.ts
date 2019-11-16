import { MatDialog } from '@angular/material/dialog';
import { AppInjector } from '../shared/app-injector';

import { IControl, Map } from 'mapbox-gl';

import { FilterComponent } from './filter.component';

export class MyFilterControl implements IControl {

    mapRef: Map;
    container: HTMLDivElement;
    private modal: MatDialog;

    constructor() {

        // get instance of MatDialog via Angular Injector
        // necessary because the mapbox Control Class has no constructor arguments, so we cant use constructor dependency injection
        this.modal = AppInjector.get(MatDialog);
    }

    onAdd(map: Map): HTMLDivElement {

        this.mapRef = map;

        this.container = document.createElement('div');
        this.container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = 'Filter';
        btn.classList.add('mapboxgl-ctrl-icon', 'mapboxgl-ctrl-filter');

        btn.addEventListener('click', ev => {

            ev.stopPropagation();
            this.modal.open(FilterComponent);
        });

        this.container.appendChild(btn);

        return this.container;
    }

    onRemove(map: Map) {
        this.container.parentNode.removeChild(this.container);
        this.mapRef = undefined;
    }
}
