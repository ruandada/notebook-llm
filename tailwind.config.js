const { platformSelect, platformColor } = require('nativewind/theme')

const JSYaml = require('js-yaml')
const fs = require('fs')
const { join } = require('path')

const createThemeColorPalette = () => {
  const theme = JSYaml.load(
    fs.readFileSync(join(__dirname, 'assets', 'theme.yaml'), 'utf8')
  )

  const map = (colorName) => {
    const color = theme.colors[colorName]

    if (!color) {
      return undefined
    }

    return {
      [colorName]: platformSelect({
        ...(color.ios ? { ios: platformColor(color.ios) } : {}),
        ...(color.android ? { android: platformColor(color.android) } : {}),
        default: `var(--theme-color-${colorName})`,
      }),

      ...(color.light
        ? {
            [`${colorName}-light`]: color.light,
          }
        : {}),

      ...(color.dark
        ? {
            [`${colorName}-dark`]: color.dark,
          }
        : {}),
    }
  }

  return Object.keys(theme.colors).reduce((acc, colorName) => {
    return {
      ...acc,
      ...map(colorName),
    }
  }, {})
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: createThemeColorPalette(),
    },
  },
  plugins: [],
}
