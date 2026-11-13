export default {
  '**/*.{ts,js,html}': (files) => {
    const fileList = files.join(' ');
    return [
      `eslint --fix ${fileList}`,
      `npx nx affected -t test --files=${files.join(',')} --passWithNoTests`
    ];
  },
};