import { MatDialog } from '@angular/material/dialog';

import { IControl, Map as MapboxMap } from 'mapbox-gl';

import { Subscription } from 'rxjs';
import { AppInjector } from '../shared/app-injector';

import { FilterService } from '../services/filter.service';
import { FilterComponent } from './filter.component';

/**
 * Class that is used to open the FilterComponent
 * from the map
 */
export class FilterControl implements IControl {

    mapRef: MapboxMap | undefined;
    container: HTMLDivElement;
    private modal: MatDialog;
    private fs: FilterService;
    private sub!: Subscription; // TODO(helene): use ? op instead after updating ts

    constructor() {

        // get instance of MatDialog via Angular Injector
        // necessary because the mapbox Control Class has no constructor arguments, so we cant use constructor dependency injection
        this.modal = AppInjector.get(MatDialog);
        this.container = document.createElement('div');

        this.fs = AppInjector.get(FilterService);
    }

    onAdd(map: MapboxMap): HTMLDivElement {

        this.mapRef = map;

        this.container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group');

        const btn = document.createElement('button');

        btn.setAttribute('type', 'button');
        btn.setAttribute('title', 'Filter');

        btn.classList.add('mapboxgl-ctrl-icon', 'mapboxgl-ctrl-filter');

        btn.addEventListener('click', ev => {

            ev.stopPropagation();
            this.modal.open(FilterComponent);
        });

        this.container.appendChild(btn);

        this.sub = this.fs.onChanged().subscribe({
            next: (filters) => {

                if (filters.badges.length || !filters.showGyms) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });

        return this.container;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRemove(_map: MapboxMap): void {
        this.container.remove();
        this.mapRef = undefined;

        this.sub.unsubscribe();
    }
}
