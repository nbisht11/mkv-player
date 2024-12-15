import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => {
            return import('./components/player/player.component').then((module)=>module.PlayerComponent)
        }
    },
    {
        path: 'home',
        pathMatch: 'full',
        loadComponent: () => {
            return import('./components/player/player.component').then((module)=>module.PlayerComponent)
        }
    },
    {
        path: 'about',
        pathMatch: 'full',
        loadComponent: () => {
            return import('./components/about/about.component').then((module)=>module.AboutComponent)
        }   
    },
    {
        path: '**',
        loadComponent: () => {
            return import('./components/player/player.component').then((module)=>module.PlayerComponent)
        }
    },
];
