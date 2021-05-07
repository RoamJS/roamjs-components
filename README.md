# roamjs-components
    
This is a collection of common UI components used by RoamJS extensions and services made available to make development easier for other Roam developers.

## Pre-Requisites

This library is built on [blueprint](https://blueprintjs.com/docs/#core), a component library developed by Palantir and the primary front end framework used by Roam. It was chosen to build most of the components in this library for consistency with Roam's frontend. 

You will therefore need to install the following peer dependencies when using this library:

```bash
npm install react react-dom @blueprintjs/core @blueprintjs/select roamjs-components
```

If you're using TypeScript, you will additionally need to install:

```bash
npm install @types/react @types/react-dom
```

## Utilities

The following are a list of methods used to help interface with the RoamJS Components found in this library.

### createConfigObserver({title, config})

This is an observer that will render the `ConfigPage` UI on the page of your choosing.

* `title: string` Name of the page to render the Configuration page ui. If this page doesn't already exist in the user's Roam database, one will be created with specified default values filled in.
* `config: object` The metadata specifying which fields your configuration supports
    * `tabs: object[]` The first level tabs grouping your fields. They map to first level blocks on the Roam Page.
        * `id: string` The name of the tab to use in both the Roam UI and in the tab label. The `home` id inserts blocks at the top level of Roam.
        * `toggleable: boolean` Whether this tab should be able to turn on and off. Turning a tab off disables the rest of the nested fields.
        * `fields: object[]` The set of field metadata grouped in this tab. If fields is empty, it will be assumed that this tab is a state container for the extension not meant to be interacted with by the user.
            * `title: string` The name of the field, displayed on the nested tag and in the Roam block.
            * `description: string` The description of the field with renders next to each field label as a tooltip.
            * `type: string` The field type, with only the following valid values:
                * `text` Renders a text input.
                * `number` Renders a number input.
                * `flag` Renders a boolean checkbox.
                * `multitext` Renders a text input that could have multiple child values. Used for an array of string values.
                * `pages` Similar to multitext, but all values are Roam pages.
                * `oauth` Renders a login button based on the service provider
                * `select` Renders a dropdown with the configured options
            * `defaultValue` The default value filled in on page creation. Field is optional and type based on type above
            * `options` An extra object of options for configuring a field, based on the type above.
                * `text` None
                * `number` None
                * `flag` None
                * `multitext` None
                * `pages` None
                * `oauth`  
                    * `service: string` The name of the service provider, used on the login button
                    * `getPopoutUrl: () => Promise<string>` A getter retrieving the url needed to begin the oauth process
                    * `getAuthData: (d: string) => Promise<Record<string, string>>` A getter that takes in a stringified JSON object from the oauth popout window and retrieves the auth related data.
                    * `ServiceIcon: React.FunctionComponent<React.SVGAttributes<SVGElement>>` The SVG Icon to render next to the login button.
                * `select`
                    * `items: string[]` The set of valid options for this dopdown

### createComponentRender(FC, className)

Creates a render function for the component `FC` rendered inside of a `ComponentContainer` component. A `ComponentContainer` simulates standard Roam `{{components}}` in that they are meant to be rendered in a block with an edit pencil icon to edit the block if necessary.
* `FC: ReactElement` The component rendered with a `blockUid` prop that references the block the component is rendered in.
* `className` An optional class name to pass to the surrounding `ComponentContainer`.

### createOverlayRender(id, Overlay)

Creates a render function for the component `Overlay` mounted on a parent from the id passed to [getRenderRoot](#getRenderRoot(id)), unmounting when the overlay closes.
* `id: string` The id passed to the parent element rendering the Overlay, interpolated inside of `roamjs-${id}-root`.
* `Overlay: ({onClose: () => void}) => ReactElement` The React component rendered with a `onClose` prop to handle unmounting.

### getRenderRoot(id)

This creates a `div` appended to Roam's natural react root, most commonly used as its own root element for overlay components.
* `id: string` The id of the parent element, interpolated inside of `roamjs-${id}-root`.

### getSettingIntFromTree({tree, key, defaultValue})

This is a utility method for grabbing the integer value of a node from a tree by a given key.
* `tree: TextNode[]` The array of `TextNode` to search through.
* `key: string` The key used to find the desired node
* `defaultValue?: number` The default value the getter should have if there are no nodes with the specified key, defaulted to 0.

### getSettingValueFromTree

This is a utility method for grabbing the string value of a node from a tree by a given key.
* `tree: TextNode[]` The array of `TextNode` to search through.
* `key: string` The key used to find the desired node
* `defaultValue?: number` The default value the getter should have if there are no nodes with the specified key, defaulted to an empty string.

### getSettingValuesFromTree

This is a utility method for grabbing the string value of a node from a tree by a given key.
* `tree: TextNode[]` The array of `TextNode` to search through.
* `key: string` The key used to find the desired node
* `defaultValue?: number` The default value the getter should have if there are no nodes with the specified key, defaulted to an empty string.

## Components

The following are a list of React components commonly used across RoamJS extensions.

