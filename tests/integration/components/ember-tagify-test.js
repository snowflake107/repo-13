import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ember-tagify', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.value = '[{"value":"foo"},{"value":"bar"}]';
    this.onTagChange = () => {};

    await render(hbs`<EmberTagify 
                        placeholder='Please enter the tag'
                        @value={{this.value}}
                        @onChange={{this.onTagChange}}
                        data-id="input-tagify"
                    />`);

    assert.equal(this.element.querySelector('input').value, this.value);

    assert.dom('input[data-id="input-tagify"]').value = '[{"value":"foo"},{"value":"bar"},{"value":"kuku"}]';
    assert.equal(this.element.querySelector('input').value, this.value);
  });

  test('onchage event fires', async function(assert) {
    this.changedValue = [];
    this.onTagChange = (e) => { 
      this.changedValue = e.target.value; 
    };

    this.set('value', '[{"value":"foo"},{"value":"bar"}]');
    await render(hbs`<EmberTagify 
                        placeholder='Please enter the tag'
                        @value={{this.value}}
                        @onChange={{this.onTagChange}}
                    />`);
                
    // change value  
    await fillIn(this.element.querySelector('input'), '[{"value":"foo"},{"value":"bar"},{"value":"kuku"}]');
    
    // validate onChange event fired
    assert.equal(this.element.querySelector('input').value, this.changedValue);
  });

});
