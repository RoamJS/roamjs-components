# roamjs-components
    
This is a collection of common UI components used by RoamJS extensions made available to make development easier for other Roam developers.

## Util

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

### addInputSetting

This is a utility method for adding a value as part of multiple to a key by making it a descendant of node in the tree.
* `blockUid: string` The uid of the root block housing all of settings.
* `value: string` The value to add to the setting
* `key: string` The setting name
* `index?: number` The index where the setting should be created if new, defaulted to 0

### setInputSetting

This is a utility method for setting a value to a key by making it a descendant of node in the tree.
* `blockUid: string` The uid of the root block housing all of settings.
* `value: string` The value to assign to the setting
* `key: string` The setting name
* `index?: number` The index where the setting should be created if new, defaulted to 0

### setInputSettings

This is a utility method for setting multiple values to a key by making it a descendant of node in the tree.
* `blockUid: string` The uid of the root block housing all of settings.
* `values: string` The set of values to assign to the setting
* `key: string` The setting name
* `index?: number` The index where the setting should be created if new, defaulted to 0

## Components

The following are a list of React components commonly used across RoamJS extensions.

### BlockErrorBoundary

An Error Boundary to wrap around components meant to live within blocks to catch any React Errors. The error message will interpolate inside of a `{ERROR}` placeholder within the `message` prop and output as a child block.

### Description

An info icon with a tooltip, used to give help text to UI components.

### MenuItemSelect

A standard Select using blueprint's MenuItem component as the item rendered.

### WarningToast

Renders a yellow warning message, then unmounts itself upon dismissing.
