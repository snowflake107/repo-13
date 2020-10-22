# ember-tagify

## Tagify input

<DocsDemo as |demo|>
  <demo.example @name="ember-tagify.hbs">
    <EmberTagify
      class={{this.classString}}
      placeholder="Type a tag"
      @value={{this.value}}
      @onChange={{this.onTagChange}}
    />
  </demo.example>

  <div class="docs-m-4">
    <p class="selectedValue">
      Your tags: {{this.tags}}
    </p>
  </div>
  
  <demo.snippet @name="ember-tagify.hbs"/>
</DocsDemo>
