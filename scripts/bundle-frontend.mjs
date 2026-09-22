import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'app.js',
  format: 'iife',
  sourcemap: true,
  target: ['es2020'],
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for frontend changes in src/...');
} else {
  const startTime = Date.now();
  await esbuild.build(buildOptions);
  console.log(`Frontend bundled to app.js in ${Date.now() - startTime}ms`);
}
