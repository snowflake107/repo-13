import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, typeIn, triggerKeyEvent, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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

  test('onChange event fires', async function(assert) {
    this.changedValue = [];
    this.onTagChange = (e) => { 
      this.changedValue = e.detail.value; 
    };

    this.set('value', '[{"value":"foo"},{"value":"bar"}]');
    await render(hbs`<EmberTagify 
                        placeholder='Please enter the tag'
                        @value={{this.value}}
                        @onChange={{this.onTagChange}}
                    />`);
                
    let tagifyInputElement = this.element.querySelector('.tagify__input');
    // change value
    await fillIn(tagifyInputElement, '[{"value":"foo"},{"value":"bar"},{"value":"kuku"}]');
    
    // validate onChange event fired by comparing to the value on input element
    assert.equal(this.element.querySelector('input').value, this.changedValue);
  });

  test('onAdd event fires', async function(assert) {
    this.tagAdded = false;
    this.onAddTag = () => { 
      this.tagAdded = true;
    };

    this.value = '[{"value":"foo"},{"value":"bar"}]';
    await render(hbs`<EmberTagify 
                        placeholder='Please enter the tag'
                        @value={{this.value}}
                        @onAddTag={{this.onAddTag}}
                        autofocus
                    />`);

    let tagifyInputElement = this.element.querySelector('.tagify__input');
    // mimic user adding new tag  
    await typeIn(tagifyInputElement, 'kuku');
    await triggerKeyEvent(tagifyInputElement, 'keydown', 'Enter');

    // validate onAdd event fired
    assert.ok(this.tagAdded);
  });

  test('setting value affects tagify', async function(assert) {
    this.set('tags_value', '[{"value":"foo"},{"value":"bar"}]');
    await render(hbs`<EmberTagify 
                        placeholder='Please enter the tag'
                        @value={{this.tags_value}}
                    />`);
    // change value  
    this.set('tags_value','[{"value":"foo"},{"value":"bar"},{"value":"kuku"}]');
    await settled();
    // validate onChange event fired
    assert.equal(this.element.querySelector('input').value, this.tags_value);
  });
});
