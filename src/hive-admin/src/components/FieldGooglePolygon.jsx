import React from 'react'
import padStart from 'lodash/padStart'
import isFinite from 'lodash/isFinite'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import Admin from './Admin'
import Field from './Field'

import './FieldGooglePolygon.less'

export default class FieldGooglePolygon extends Field {
  constructor(props) {
    super(props)
    this.state = {
      container: null,
      coordinates: [],
    }
  }

  shouldComponentUpdate(props) {
    if (props.value !== this.props.value) {
      this.addPolygonFromValue(props)
    }
    return false
  }

  componentDidMount() {
    this.state.map = new global.google.maps.Map(this.state.container, {
      scaleControl: true,
      center: {
        lng: 13.718345629452529,
        lat: 47.67618982807602,
      },
      zoom: 15,
      disableDefaultUI: true,
      gestureHandling: 'cooperative',
      clickableIcons: false,
      ...(this.props.initialMapConfig || {}),
    })
    if (this.props.mapMouseMoveDebug) {
      let debugCounter = 0
      this.state.map.addListener('mousemove', (event) => {
        // eslint-disable-next-line no-console
        console.log(
          `${padStart(
            `${debugCounter++}`,
            6,
            '0'
          )} map debug: lng: ${event.latLng.lng()}, lat: ${event.latLng.lat()}, zoom: ${
            this.state.map.zoom
          }, clng: ${this.state.map.center.lng()}, clat: ${this.state.map.center.lat()}`
        )
      })
    }
    this.state.drawer = new global.google.maps.drawing.DrawingManager({
      drawingControlOptions: {
        position: global.google.maps.ControlPosition.LEFT_TOP,
        drawingModes: ['polygon'],
      },
      polygonOptions: {
        clickable: true,
        editable: true,
        draggable: true,
      },
      ...(this.props.initialDrawerConfig || {}),
    })
    this.state.drawer.addListener('polygoncomplete', (polygon) => {
      this.addPolygon(polygon)
      this.changeValueFromPolygon(polygon)
    })
    this.state.drawer.setMap(this.state.map)
    this.addPolygonFromValue(this.props)
  }

  addPolygon(polygon) {
    if (this.state.polygon !== polygon) {
      if (this.state.polygon) {
        this.removePolygon()
      }
      this.state.polygon = polygon
      this.state.polygon.setMap(this.state.map)
      this.state.polygon.addListener('dblclick', (event) => {
        event.stop()
        this.removePolygon()
      })
      this.state.polygon.addListener('mouseup', () => {
        this.changeValueFromPolygon(this.state.polygon)
      })
      this.state.polygon.addListener('contextmenu', (event) => {
        if (isFinite(event.vertex)) {
          const path = this.state.polygon.getPath()
          if (path.getArray().length <= 3) {
            this.removePolygon()
          } else {
            path.removeAt(event.vertex)
          }
        }
      })
      this.state.drawer.setDrawingMode(null)
      this.state.drawer.setOptions({ drawingControl: false })
    }
  }

  removePolygon() {
    if (this.props.value) {
      this.props.onChange(null)
    }
    if (this.state.polygon) {
      this.state.polygon.setMap(null)
      this.state.polygon = null
      this.state.drawer.setDrawingMode('polygon')
      this.state.drawer.setOptions({ drawingControl: true })
    }
  }

  changeValueFromPolygon(polygon) {
    const coordinates = []
    polygon
      .getPath()
      .getArray()
      .forEach((point) => coordinates.push([point.lng(), point.lat()]))
    if (coordinates && coordinates[0]) {
      coordinates.push([...coordinates[0]])
    }
    this.props.onChange({
      type: 'Polygon',
      coordinates: [coordinates],
    })
  }

  addPolygonFromValue({ value }) {
    if (
      isObject(value) &&
      isArray(value.coordinates) &&
      value.coordinates[0] &&
      value.coordinates[0].length
    ) {
      const coords = value.coordinates[0].slice(0, -1)
      if (this.state.polygon) {
        const path = this.state.polygon
          .getPath()
          .getArray()
          .map((point) => [point.lng(), point.lat()])
        if (
          path.length !== value.coordinates[0].length ||
          path.findIndex(
            (point, i) => point[0] !== coords[i][0] || point[1] !== coords[i][1]
          ) > -1
        ) {
          this.state.polygon.setPath(coords.map(([lng, lat]) => ({ lng, lat })))
        }
      } else {
        this.addPolygon(
          new global.google.maps.Polygon({
            editable: true,
            draggable: true,
            paths: coords.map(([lng, lat]) => ({ lng, lat })),
            ...(this.props.polygonExtraParameters || {}),
          })
        )
        const bounds = new global.google.maps.LatLngBounds()
        coords.forEach(([lng, lat]) => bounds.extend({ lng, lat }))
        this.state.map.fitBounds(bounds)
      }
    } else {
      this.removePolygon()
    }
  }

  render() {
    return (
      <div className="field-google-map" data-disabled={this.props.disabled}>
        <div
          className="field-google-map-container"
          style={{ height: this.props.mapContainerHeight || '300px' }}
          ref={(ref) => {
            this.state.container = ref
          }}
        />
      </div>
    )
  }
}

Admin.addToLibrary('FieldGooglePolygon', (config) =>
  FieldGooglePolygon.create(config)
)
