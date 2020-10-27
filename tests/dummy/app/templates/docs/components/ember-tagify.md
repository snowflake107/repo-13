# ember-tagify

## Tagify input

{{log this.tagsvalue}}

<DocsDemo as |demo|>
  <demo.example @name="ember-tagify.hbs">
    <EmberTagify
      class={{this.classString}}
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
