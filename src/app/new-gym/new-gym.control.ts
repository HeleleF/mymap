import { IControl, Map } from 'mapbox-gl';
import { MatDialog } from '@angular/material/dialog';

import { AppInjector } from '../shared/app-injector';

import { NewGymComponent } from './new-gym.component';

export class NewGymControl implements IControl {

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
        btn.title = 'New gym';
        btn.classList.add('mapboxgl-ctrl-icon', 'mapboxgl-ctrl-add-location');

        btn.addEventListener('click', ev => {

            ev.stopPropagation();
            this.modal.open(NewGymComponent, { width: '500px' });
        });

        this.container.appendChild(btn);

        return this.container;
    }

    onRemove(map: Map) {
        this.container.parentNode.removeChild(this.container);
        this.mapRef = undefined;
    }
}
