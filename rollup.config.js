import {babel} from '@rollup/plugin-babel';
import clear from 'rollup-plugin-clear';
export default {
    input: './demo/demo.js',
    plugins:[
        clear({
            targets: ['./readme']
        }),
        babel({ babelHelpers: 'bundled' })
    ]
}
