// resources/js/routes/login.ts
import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from '../resources/js/wayfinder'

type StoreRoute = {
    (options?: RouteQueryOptions): RouteDefinition<'post'>;
    definition: { methods: string[]; url: string };
    url: (options?: RouteQueryOptions) => string;
    post: (options?: RouteQueryOptions) => RouteDefinition<'post'>;
    form: (options?: RouteQueryOptions) => RouteFormDefinition<'post'>;
};

export const store: StoreRoute = Object.assign(
    (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
        url: '/login' + queryParams(options),
        method: 'post',
    }),
    {
        definition: {
            methods: ["post"],
            url: '/login',
        },
        url: (options?: RouteQueryOptions) => '/login' + queryParams(options),
        post: (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
            url: '/login' + queryParams(options),
            method: 'post',
        }),
        form: (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            method: 'post',
            action: '/login' + queryParams(options),
        }),
    }
);