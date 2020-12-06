/** @documenter yuidoc */

import Component from '@glimmer/component';
import { action } from '@ember/object';
// import { assert } from '@ember/debug';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import Tagify from '@yaireo/tagify';

export default class EmberTagifyComponent extends Component {
    tagifyRef = null;

    @action
    onInsert(element) {
      this.setupTagify(element);
    }
    
    @action
    onWillDestroy() {
      if (this.tagifyRef) {
        this.tagifyRef.destroy();
      }
    }

    @action
    onValueUpdated() {
      const new_value = this.args.value;
      const cur_value = this.tagifyRef.value.map((item) => item['value']).join(',');
  
      if (typeof new_value !== 'undefined' && cur_value !== new_value) {
        this.tagifyRef.removeAllTags();
        this.tagifyRef.addTags(new_value);
      }
    }

    @action
    onClassUpdated() {
      const newClass = this.args.class;
      // tagify main CSS class needs to be ther ealways
      this.tagifyRef.DOM.scope.className = 'tagify ' + newClass;
    }

    setupTagify(element) {
        // const { value } = this.args;
        // // Require that users pass a value
        // assert(
        //   '<EmberTagify> requires a `value` to be passed for tagify input.',
        //   value !== undefined
        // );
    
        // Pass all values and setup tagify
        run.scheduleOnce('afterRender', this, this._setTagifyOptions, element);
    }

    _setTagifyOptions(element) {
        const fastboot = getOwner(this).lookup('service:fastboot');
        if (fastboot && fastboot.isFastBoot) {
          return;
        }

        const { 
          onChange,
          onAddTag,
          onRemoveTag, 
          value,
          editTags,
          ...rest 
        } = this.args;

        let options = {
          callbacks: {
            "change": onChange || this.onChange,
            "add": onAddTag || this.onAddTag,
            "remove": onRemoveTag || this.onRemoveTag,
          },
          editTags: Object.assign({}, editTags),
          ...rest
        };
        // revert to default if not provided        
        if (!editTags) {
          delete options.editTags;
        }
        this.tagifyRef = new Tagify(element, options);
        this.tagifyRef.addTags(value);
    }

    @action
    onChange() {}

    @action
    onAddTag() {}

    @action
    onRemoveTag() {}
}
