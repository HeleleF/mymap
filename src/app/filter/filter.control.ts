import { MatDialog } from '@angular/material/dialog';
import { AppInjector } from '../shared/app-injector';

import { IControl, Map } from 'mapbox-gl';

import { Subscription } from 'rxjs';

import { FilterComponent } from './filter.component';
import { FilterService } from '../services/filter.service';

/**
 * Class that is used to open the FilterComponent
 * from the map
 */
export class FilterControl implements IControl {

    mapRef: Map | undefined;
    container: HTMLDivElement;
    private modal: MatDialog;
    private fs: FilterService;
    private sub!: Subscription;

    constructor() {

        // get instance of MatDialog via Angular Injector
        // necessary because the mapbox Control Class has no constructor arguments, so we cant use constructor dependency injection
        this.modal = AppInjector.get(MatDialog);
        this.container = document.createElement('div');

        this.fs = AppInjector.get(FilterService);
    }

    onAdd(map: Map): HTMLDivElement {

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

                if (filters.gyms || filters.quests || !filters.showGyms || !filters.showQuests) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });

        return this.container;
    }

    onRemove(map: Map) {
        this.container.remove();
        this.mapRef = undefined;

        this.sub.unsubscribe();
    }
}
