import pluginMeta from './Plugin.Meta';
import PluginComponent from './PluginComponent.vue';

import { PanelPlugin, DataSourceSystemAdapter } from './../../DTCD-SDK/index';

export class Plugin extends PanelPlugin {
  static getRegistrationMeta() {
    return pluginMeta;
  }
  constructor(guid, selector) {
    super();

    const dataSourceSystem = new DataSourceSystemAdapter();

    const VueJS = this.getDependence('Vue');

    const data = { guid, dataSourceSystem };

    new VueJS.default({
      data: () => data,
      render: h => h(PluginComponent),
    }).$mount(selector);
  }
}
