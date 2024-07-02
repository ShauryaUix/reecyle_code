import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uniq from 'lodash/uniq';
import isArray from 'lodash/isArray';

interface Source {
  url: string;
  format: string;
}

interface Props {
  name: string;
  weights: number[];
  sources: Record<number, Source>;
}

export function renderCss({ name, weight, src }: { name: string; weight: number; src: Source | Source[] }) {
  return [
    '@font-face{',
    `font-family:"${name}";`,
    `font-weight:${weight};`,
    `src:${
      isArray(src)
        ? src
          .map(({ url, format }) => `url("${url}") format("${format}")`)
          .join(',')
        : `url("${src.url}") format("${src.format}")`
    }`,
    '}',
  ].join('');
}

export default class FontFace extends Component<Props> {
  static propTypes = {
    name: PropTypes.string.isRequired,
    weights: PropTypes.arrayOf(PropTypes.number).isRequired,
    sources: PropTypes.shape({}).isRequired,
  };

  static create(name: string, sources: Record<number, Source>, defaultWeights: number[]) {
    const FontFaceClass = this;
    return ({ weights }: { weights?: number[] }) => (
      <FontFaceClass
        name={name}
        sources={sources}
        weights={weights || defaultWeights}
      />
    );
  }

  shouldComponentUpdate(nextProps: Props) {
    const {
      name: currentName,
      sources: currentSources,
      weights: currentWeights,
    } = this.props;
    const {
      name: nextName,
      sources: nextSources,
      weights: nextWeights,
    } = nextProps;

    if (
      currentName !== nextName ||
      currentSources !== nextSources ||
      (
        currentWeights !== nextWeights &&
        (
          currentWeights.length !== nextWeights.length ||
          uniq([...currentWeights, ...nextWeights]).length !== currentWeights.length
        )
      )
    ) {
      return true;
    }
    return false;
  }

  render() {
    const { name, weights, sources } = this.props;
    const css = weights
      .map((weight) => {
        const source = sources[weight];
        if (!source) {
          const message = `FontFace "${name}" is missing the source for weight ${weight}`;
          if (process.env.NODE_ENV !== 'production') {
            throw new Error(message);
          } else {
            console.warn(message);
          }
          return message;
        }
        return renderCss({
          name,
          weight,
          src: source,
        });
      })
      .join('');
    return <style>{css}</style>;
  }
}
