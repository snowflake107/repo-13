## Usage

```handlebars
<InputTagify
  placeholder="Type a tag and hit Enter"
  @value={{this.value}}
  @onChange={{this.onChange}} {{!-- Required Option --}}
/>
```

- (`value` and `onChange` are the only required options, but you can pass null if you do not care about it. All other options are taken straight from the tagify options, but they have defaults and you only need to pass what you need.)

You can then use the locales you imported by specifying which you want in your template, like so:

```handlebars
<InputTagify
  @value={{this.value}}
  @onChange={{this.onChange}}
/>
```

## Updating Attributes


## tagifyRef

If you need to interact directly with the tagify instance you have created inside the component, you can use the action `onReady` as `onReady={{this.onReady}}`. The function signature of your onReady callback should look like the following example:

```javascript
@action
onReady(_selectedDates, _dateStr, instance) {
  this.tagifyRef = instance;
};
```

This action will only get called once per instance and that is when the tagifyRef input has been fully created.

Once you have stored the instance, you can then do things like `this.tagifyRef.close()` to close the tagify, if you wanted to make a close button.

## Options

All options available to Tagify are available.

Please see the [tagify docs](https://github.com/yairEO/tagify/) for a full list of options.