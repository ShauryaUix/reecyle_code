import React, { Component, createRef } from 'react'
import styled from 'styled-components'

import Select from 'antd/lib/select'
import Input from 'antd/lib/input'
import Icon from 'antd/lib/icon'
import isObject from 'lodash/isObject'
import Admin from './Admin'
import Field from './Field'

import './FieldGoogleAddress.less'

const DEFAULT_VALUE = {
  line1: '',
  coordinates: [13.718345629452529, 47.67618982807602],
}

const AutocompleteWrapper = styled.div`
  display: flex;
  width: 100%;
`

const AutocompleteInput = styled(Input)`
  width: 100%;
`

const PostalCodeAndCityWrapper = styled.div`
  display: flex;
  margin-top: 15px;
`

const PostalCodeAndCityDivider = styled.div`
  display: flex;
  width: 25px;
`

export class GoogleMap extends Component {
  static defaultProps = {
    lng: 13.718345629452529,
    lat: 47.67618982807602,
    zoom: 15,
    disabled: false,
    onChange: ([lng, lat]) => console.log(lng, lat), // eslint-disable-line no-console
  }

  constructor(props) {
    super(props)
    this.mutable = {
      container: null,
      lng: this.props.lng,
      lat: this.props.lat,
    }
    global.MAP = this
  }

  componentDidMount() {
    this.mutable.map = new global.google.maps.Map(this.mutable.container, {
      scaleControl: true,
      center: { lng: this.mutable.lng, lat: this.mutable.lat },
      zoom: 15,
      disableDefaultUI: true,
      gestureHandling: 'cooperative',
      clickableIcons: false,
      ...(this.props.initialMapConfig || {}),
    })
    this.mutable.map.addListener('dragend', () => {
      const center = this.mutable.map.getCenter()
      this.mutable.lng = center.lng()
      this.mutable.lat = center.lat()
      this.props.onChange([this.mutable.lng, this.mutable.lat])
    })
  }

  shouldComponentUpdate(props) {
    if (props.lng !== this.mutable.lng || props.lat !== this.mutable.lat) {
      this.mutable.lng = props.lng
      this.mutable.lat = props.lat
      this.mutable.map.setCenter({
        lng: props.lng,
        lat: props.lat,
      })
      this.mutable.map.setZoom(15)
    }
    return false
  }

  render() {
    return (
      <div className="field-google-map" data-disabled={this.props.disabled}>
        <div
          className="field-google-map-container"
          ref={(ref) => {
            this.mutable.container = ref
          }}
        />
        <Icon className="field-address-center-icon" type="environment" />
      </div>
    )
  }
}

export default class FieldGoogleAddress extends Field {
  static config = {
    ...Field.config,
    initialValue: DEFAULT_VALUE,
    getChoiceValue: (choice) =>
      isObject(choice) ? choice.value : `${choice.value}`,
    getChoiceLabel: (choice) => (isObject(choice) ? choice.label : `${choice}`),
    renderChoices: (field, props, choices) =>
      choices.map((choice) => props.renderChoice(choice, field, props)),
    choiceClass: Select.Option,
    renderChoice: (choice, field, props) => (
      <props.choiceClass
        key={props.getChoiceValue(choice, field, props)}
        value={props.getChoiceValue(choice, field, props)}
      >
        {props.getChoiceLabel(choice, field, props)}
      </props.choiceClass>
    ),
    placeholder: 'Type to search for address',
    extraGeocodingParams: {},
    getExtraGeocodingParams: (props) => props.extraGeocodingParams || {},
    extraAutocompleteParams: {},
    getExtraAutocompleteParams: (props) => props.extraAutocompleteParams || {},
    extraMapProps: {},
    getExtraMapProps: (props) => props.extraMapProps || {},
    MapComponent: GoogleMap,
    line2Props: {},
    getLine2Props: (props) => props.line2Props,
    postalCodeProps: {},
    getPostalCodeProps: (props) => props.postalCodeProps,
    cityProps: {},
    getCityProps: (props) => props.cityProps,
  }

  static inputPropsMap = {
    ...Field.inputPropsMap,
    dataSource: true,
    placeholder: true,
    reload: true,
  }

  constructor(props) {
    super(props)
    this.line1Ref = this.props.line1Ref || createRef()
    this.mapRef = this.props.mapRef || createRef()
    this.state = {
      geocoder: new global.google.maps.Geocoder(),
      search: '',
    }
  }

  componentDidMount() {
    super.componentDidMount && super.componentDidMount()
    // eslint-disable-next-line no-undef
    this.autocomplete = new google.maps.places.Autocomplete(
      this.line1Ref.current.input,
      { ...(this.props.getExtraAutocompleteParams(this.props) || {}) }
    )
    this.autocomplete.bindTo('bounds', this.mapRef.current.mutable.map)
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace()
      if (place && place.geometry && place.geometry.location) {
        const result = place
        const coordinates = [
          result.geometry.location.lng(),
          result.geometry.location.lat(),
        ]
        const extras = {}
        if (result.address_components) {
          const resultCountry = result.address_components.find(
            (item) =>
              item.types &&
              item.types[0] === 'country' &&
              item.short_name &&
              item.short_name.length === 2
          )
          if (resultCountry) {
            const countryCode = resultCountry.short_name.toLowerCase()
            extras.country = countryCode
          }
        }
        if (result.address_components) {
          const cityComponent = result.address_components.find((component) =>
            component.types.includes('locality')
          )
          if (cityComponent) {
            extras.city = cityComponent.long_name
          }
        }
        this.props.onChange({
          ...(this.props.initialValue || {}),
          ...(this.props.value || {}),
          ...extras,
          line1: this.line1Ref.current.input.value,
          coordinates,
        })
      }
    })
  }

  handleCoordinatesChange = (coordinates) => {
    this.props.onChange({
      ...(this.props.initialValue || {}),
      ...(this.props.value || {}),
      coordinates,
    })
  }

  handleLine1Change = (ev) => {
    if (ev && ev.target) {
      this.props.onChange({
        ...(this.props.initialValue || {}),
        ...(this.props.value || {}),
        line1: ev.target.value,
      })
    }
  }

  handleLine2Change = (ev) => {
    if (ev && ev.target) {
      this.props.onChange({
        ...(this.props.initialValue || {}),
        ...(this.props.value || {}),
        line2: ev.target.value || '',
      })
    }
  }

  handlePostalCodeChange = (ev) => {
    if (ev && ev.target) {
      this.props.onChange({
        ...(this.props.initialValue || {}),
        ...(this.props.value || {}),
        postalCode: ev.target.value || '',
      })
    }
  }

  handleCityChange = (ev) => {
    if (ev && ev.target) {
      this.props.onChange({
        ...(this.props.initialValue || {}),
        ...(this.props.value || {}),
        city: ev.target.value || '',
      })
    }
  }

  // eslint-disable-next-line no-unused-vars
  renderInput(props, extras) {
    const { type, addonBefore, addonAfter, value, ...restProps } = props
    return (
      <AutocompleteWrapper>
        <AutocompleteInput
          key={props.name}
          {...restProps}
          value={props.value ? props.value.line1 : ''}
          placeholder={this.props.placeholder || 'Address, building or area'}
          ref={this.line1Ref}
          onChange={this.handleLine1Change}
          addonBefore={this.props.addonBefore}
        />
      </AutocompleteWrapper>
    )
  }

  render() {
    const value = {
      ...DEFAULT_VALUE,
      ...(this.props.value || {}),
    }
    const line2Props = this.props.getLine2Props(this.props)
    const postalCodeProps = this.props.getPostalCodeProps(this.props)
    const cityProps = this.props.getCityProps(this.props)
    const { MapComponent } = this.props
    return (
      <div className="field-address">
        {super.render()}
        {line2Props ? (
          <Input
            placeholder="Entrance, floor, appartment, etc."
            {...line2Props}
            style={{
              marginTop: '15px',
              ...(line2Props.style || {}),
            }}
            value={value && value.line2 ? value.line2 : ''}
            onChange={this.handleLine2Change}
          />
        ) : null}
        {postalCodeProps || cityProps ? (
          <PostalCodeAndCityWrapper>
            {postalCodeProps ? (
              <Input
                placeholder="Postal Code"
                autoComplete="new-postal-code"
                {...postalCodeProps}
                style={{ ...(postalCodeProps.style || {}) }}
                value={value && value.postalCode ? value.postalCode : ''}
                onChange={this.handlePostalCodeChange}
              />
            ) : null}
            {postalCodeProps && cityProps ? <PostalCodeAndCityDivider /> : null}
            {cityProps ? (
              <Input
                placeholder="City"
                autoComplete="new-city"
                {...cityProps}
                style={{ ...(cityProps.style || {}) }}
                value={value && value.city ? value.city : ''}
                onChange={this.handleCityChange}
              />
            ) : null}
          </PostalCodeAndCityWrapper>
        ) : null}
        <MapComponent
          ref={this.mapRef}
          lng={value.coordinates[0]}
          lat={value.coordinates[1]}
          client={this.props.client}
          disabled={this.props.disabled}
          onChange={this.handleCoordinatesChange}
          style={
            this.props.disabled ? { pointerEvents: 'none', opacity: 0.3 } : {}
          }
          initialMapConfig={this.props.initialMapConfig}
          {...this.props.getExtraMapProps(this.props)}
        />
      </div>
    )
  }
}

Admin.addToLibrary('FieldGoogleAddress', (config) =>
  FieldGoogleAddress.create(config)
)
