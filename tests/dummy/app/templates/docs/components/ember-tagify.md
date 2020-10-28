# ember-tagify

## Tagify input

{{log this.tagsvalue}}

<DocsDemo as |demo|>
  <label for="enable-error-state">Enable Error State</label>
  <Input
    @id="enable-error-state"
    @type="checkbox"
    @checked={{this.isErroState}}
  />

  <demo.example @name="ember-tagify.hbs">
    <EmberTagify
      @class={{if this.isErroState "tagify-failure" this.classStringDefault}}
      placeholder="Type a tag"
      @value={{this.tagsvalue}}
      @onChange={{this.onTagChange}}
      @onAddTag={{this.onTagAdded}}
      @onRemoveTag={{this.onTagRemoved}}
    />
  </demo.example>

  <button type="button" {{action 'clearAll'}}>Clear All</button>

  <div class="docs-m-4">
    <p class="selectedValue">
      Your tags: {{this.tags}}
    </p>
  </div>
  
  <demo.snippet @name="ember-tagify.hbs"/>
</DocsDemo>
