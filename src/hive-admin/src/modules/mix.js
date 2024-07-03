export default function mix(main, ...mixins) {
  return mixins.reduce((parent, mixin) => mixin(parent), main)
}
