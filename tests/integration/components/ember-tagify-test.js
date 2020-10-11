import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ember-tagify', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.value = '[{"value":"foo"},{"value":"bar"}]';
    this.onTagChange = () => {};

    await render(hbs`<EmberTagify 
                        placeholder='Please enter the tag'
                        @value={{this.value}}
                        @onChange={{this.onTagChange}}
                    />`);

    assert.equal(this.element.querySelector('input').value, this.value);
  });
});
