import * as assets from "@lib/api/assets";
import * as commands from "@lib/api/commands";
import { getVendettaLoaderIdentity, isPyonLoader } from "@lib/api/native/loader";
import patcher from "@lib/api/patcher";
import * as storage from "@lib/api/storage";
import { createStorage } from "@lib/api/storage";
import * as debug from "@lib/debug";
import * as plugins from "@lib/managers/plugins";
import * as themes from "@lib/managers/themes";
import { loaderConfig, settings } from "@lib/settings";
import * as utils from "@lib/utils";
import { logModule } from "@lib/utils/logger";
import * as metro from "@metro";
import * as common from "@metro/common";
import { Forms } from "@metro/common/components";
import * as commonComponents from "@metro/common/components";
import { getFindContext } from "@metro/proxy";
import * as alerts from "@ui/alerts";
import * as color from "@ui/color";
import * as components from "@ui/components";
import { createThemedStyleSheet } from "@ui/styles";
import * as toasts from "@ui/toasts";
import { createElement, useEffect } from "react";
import { View } from "react-native";

export async function createVdPluginObject(plugin: plugins.BunnyPlugin, initial = false) {
    return {
        ...window.vendetta,
        plugin: {
            id: plugin.id,
            manifest: plugin.manifest,
            // Wrapping this with wrapSync is NOT an option.
            storage: await createStorage<Record<string, any>>(storage.createMMKVBackend(plugin.id)),
            initial,
        },
        logger: new logModule(`Bunny » ${plugin.manifest.name}`),
    };
}

export const initVendettaObject = (): any => {
    const api = window.vendetta = {
        patcher: {
            before: patcher.before,
            after: patcher.after,
            instead: patcher.instead
        },
        metro: {
            modules: window.modules,
            find: (filter: (m: any) => boolean) => {
                return metro.findExports(metro.createSimpleFilter(filter, cyrb64Hash(new Error().stack!)));
            },
            findAll: (filter: (m: any) => boolean) => {
                return metro.findAllExports(metro.createSimpleFilter(filter, cyrb64Hash(new Error().stack!)));
            },
            findByProps: (...props: any[]) => {
                // TODO: remove this hack to fix Decor
                if (props.length === 1 && props[0] === "KeyboardAwareScrollView") {
                    props.push("listenToKeyboardEvents");
                }

                const ret = metro.findByProps(...props);
                if (ret == null) {
                    if (props.includes("ActionSheetTitleHeader")) {
                        const module = metro.findByProps("ActionSheetRow");

                        // returning a fake object probably wouldn't cause an issue,
                        // since the original object are full of getters anyway
                        return {
                            ...module,
                            ActionSheetTitleHeader: module.BottomSheetTitleHeader,
                            ActionSheetContentContainer: ({ children }: any) => {
                                useEffect(() => console.warn("Discord has removed 'ActionSheetContentContainer', please move into something else. This has been temporarily replaced with View"), []);
                                return createElement(View, null, children);
                            }
                        };
                    }
                }

                return ret;
            },
            findByPropsAll: (...props: any) => metro.findByPropsAll(...props),
            findByName: (name: string, defaultExp?: boolean | undefined) => {
                // TODO: remove this hack to fix Decor
                if (name === "create" && typeof defaultExp === "undefined") {
                    return metro.findByName("create", false).default;
                }

                return metro.findByName(name, defaultExp ?? true);
            },
            findByNameAll: (name: string, defaultExp: boolean = true) => metro.findByNameAll(name, defaultExp),
            findByDisplayName: (displayName: string, defaultExp: boolean = true) => metro.findByDisplayName(displayName, defaultExp),
            findByDisplayNameAll: (displayName: string, defaultExp: boolean = true) => metro.findByDisplayNameAll(displayName, defaultExp),
            findByTypeName: (typeName: string, defaultExp: boolean = true) => metro.findByTypeName(typeName, defaultExp),
            findByTypeNameAll: (typeName: string, defaultExp: boolean = true) => metro.findByTypeNameAll(typeName, defaultExp),
            findByStoreName: (name: string) => metro.findByStoreName(name),
            common: {
                constants: common.constants,
                channels: common.channels,
                i18n: common.i18n,
                url: common.url,
                toasts: common.toasts,
                stylesheet: {
                    createThemedStyleSheet
                },
                clipboard: common.clipboard,
                assets: common.assets,
                invites: common.invites,
                commands: common.commands,
                navigation: common.navigation,
                navigationStack: common.navigationStack,
                NavigationNative: common.NavigationNative,
                Flux: common.Flux,
                FluxDispatcher: common.FluxDispatcher,
                React: common.React,
                ReactNative: common.ReactNative,
                moment: common.moment,
                chroma: common.chroma,
                lodash: common.lodash,
                util: common.util
            }
        },
        constants: {
            DISCORD_SERVER: "https://discord.gg/n9QQ4XhhJP",
            GITHUB: "https://github.com/vendetta-mod",
            PROXY_PREFIX: "https://vd-plugins.github.io/proxy",
            HTTP_REGEX: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
            HTTP_REGEX_MULTI: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
            DISCORD_SERVER_ID: "1015931589865246730",
            PLUGINS_CHANNEL_ID: "1091880384561684561",
            THEMES_CHANNEL_ID: "1091880434939482202",
        },
        utils: {
            findInReactTree: (tree: { [key: string]: any; }, filter: any) => utils.findInReactTree(tree, filter),
            findInTree: (tree: any, filter: any, options: any) => utils.findInTree(tree, filter, options),
            safeFetch: (input: RequestInfo | URL, options?: RequestInit | undefined, timeout?: number | undefined) => utils.safeFetch(input, options, timeout),
            unfreeze: (obj: object) => Object.isFrozen(obj) ? ({ ...obj }) : obj,
            without: (object: any, ...keys: any) => utils.without(object, ...keys)
        },
        debug: {
            connectToDebugger: (url: string) => debug.connectToDebugger(url),
            getDebugInfo: () => debug.getDebugInfo()
        },
        ui: {
            components: {
                Forms,
                General: common.ReactNative,
                get Alert() { return getFindContext(commonComponents.Alert)!.unproxy(); },
                get Button() { return getFindContext(commonComponents.Button)!.unproxy(); },
                get HelpMessage() { return getFindContext(commonComponents.HelpMessage)!.unproxy(); },
                get SafeAreaView() { return getFindContext(commonComponents.SafeAreaView)!.unproxy(); },
                Summary: components.Summary,
                ErrorBoundary: components.ErrorBoundary,
                Codeblock: components.Codeblock,
                Search: components.Search
            },
            toasts: {
                showToast: (content: string, asset?: number) => toasts.showToast(content, asset)
            },
            alerts: {
                showConfirmationAlert: (options: any) => alerts.showConfirmationAlert(options),
                showCustomAlert: (component: React.ComponentType<any>, props: any) => alerts.showCustomAlert(component, props),
                showInputAlert: (options: any) => alerts.showInputAlert(options)
            },
            assets: {
                all: assets.assetsMap,
                find: (filter: (a: any) => void) => assets.findAsset(filter),
                getAssetByName: (name: string) => assets.requireAssetByName(name),
                getAssetByID: (id: number) => assets.requireAssetByIndex(id),
                getAssetIDByName: (name: string) => assets.requireAssetIndex(name)
            },
            semanticColors: color.semanticColors,
            rawColors: color.rawColors
        },
        plugins: {
            plugins: plugins.plugins,
            fetchPlugin: (id: string) => plugins.fetchPlugin(id),
            installPlugin: (id: string, enabled?: boolean | undefined) => plugins.installPlugin(id, enabled),
            startPlugin: (id: string) => plugins.startPlugin(id),
            stopPlugin: (id: string, disable?: boolean | undefined) => plugins.stopPlugin(id, disable),
            removePlugin: (id: string) => plugins.removePlugin(id),
            getSettings: (id: string) => plugins.getSettings(id)
        },
        themes: {
            themes: themes.themes,
            fetchTheme: (id: string, selected?: boolean) => themes.fetchTheme(id, selected),
            installTheme: (id: string) => themes.installTheme(id),
            selectTheme: (id: string) => themes.selectTheme(id === "default" ? null : themes.themes[id]),
            removeTheme: (id: string) => themes.removeTheme(id),
            getCurrentTheme: () => themes.getThemeFromLoader(),
            updateThemes: () => themes.updateThemes()
        },
        commands: {
            registerCommand: commands.registerCommand
        },
        storage: {
            createProxy: (target: any) => storage.createProxy(target),
            useProxy: <T>(_storage: T) => storage.useProxy(_storage),
            createStorage: (backend: any) => storage.createStorage(backend),
            wrapSync: (store: any) => storage.wrapSync(store),
            awaitSyncWrapper: (store: any) => storage.awaitSyncWrapper(store),
            createMMKVBackend: (store: string) => storage.createMMKVBackend(store),
            createFileBackend: (file: string) => {
                // Redirect path to vendetta_theme.json
                if (isPyonLoader() && file === "vendetta_theme.json") {
                    file = "pyoncord/current-theme.json";
                }

                return storage.createFileBackend(file);
            }
        },
        settings,
        loader: {
            identity: getVendettaLoaderIdentity() ?? void 0,
            config: loaderConfig,
        },
        logger: {
            log: (...message: any) => console.log(...message),
            info: (...message: any) => console.info(...message),
            warn: (...message: any) => console.warn(...message),
            error: (...message: any) => console.error(...message),
            time: (...message: any) => console.time(...message),
            trace: (...message: any) => console.trace(...message),
            verbose: (...message: any) => console.log(...message)
        },
        version: debug.versionHash,
        unload: () => {
            delete window.vendetta;
        },
    };

    return () => api.unload();
};

// cyrb53 (c) 2018 bryc (github.com/bryc). License: Public domain. Attribution appreciated.
// A fast and simple 64-bit (or 53-bit) string hash function with decent collision resistance.
// Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
// See https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
// https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
const cyrb64 = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    // For a single 53-bit numeric return value we could return
    // 4294967296 * (2097151 & h2) + (h1 >>> 0);
    // but we instead return the full 64-bit value:
    return [h2 >>> 0, h1 >>> 0];
};

// An improved, *insecure* 64-bit hash that's short, fast, and has no dependencies.
// Output is always 14 characters.
const cyrb64Hash = (str: string, seed = 0) => {
    const [h2, h1] = cyrb64(str, seed);
    return h2.toString(36).padStart(7, "0") + h1.toString(36).padStart(7, "0");
};
