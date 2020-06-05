import { MatDialog } from '@angular/material/dialog';

import { IControl, Map } from 'mapbox-gl';
import { AppInjector } from '../shared/app-injector';

import { NewGymComponent } from './new-gym.component';

/**
 * Class that is used to open the NewGymComponent
 * from the map
 */
export class NewGymControl implements IControl {

    mapRef: Map | undefined;
    container: HTMLDivElement;
    private modal: MatDialog;

    constructor() {

        // get instance of MatDialog via Angular Injector
        // necessary because the mapbox Control Class has no constructor arguments, so we cant use constructor dependency injection
        this.modal = AppInjector.get(MatDialog);
        this.container = document.createElement('div');
    }

    onAdd(map: Map): HTMLDivElement {

        this.mapRef = map; 
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
        this.container.remove();
        this.mapRef = undefined;
    }
}
