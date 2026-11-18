import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

export function runStorageTests() {
  const cases = [
    ['sem dados', null, []],
    ['JSON incompleto', '{', []],
    ['null', 'null', []],
    ['objeto em vez de lista', '{}', []],
    ['texto em vez de lista', '"texto"', []],
    ['número em vez de lista', '42', []],
    ['lista de favoritos', '["1","5"]', ['1', '5']],
    ['lista do carrinho', '[{"id":"1","quantidade":2}]', [{ id: '1', quantidade: 2 }]],
  ];
  for (const [name, stored, expected] of cases) {
    const context = vm.createContext({
      document: { addEventListener() {} },
      localStorage: { getItem: () => stored },
    });
    vm.runInContext(source, context);
    const actual = vm.runInContext('armazenamento.ler("teste", [])', context);
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected, name);
  }
  const blocked = vm.createContext({
    document: { addEventListener() {} },
    localStorage: {
      getItem() { throw new Error('armazenamento bloqueado'); },
      setItem() { throw new Error('armazenamento bloqueado'); },
    },
  });
  vm.runInContext(source, blocked);
  assert.equal(vm.runInContext('armazenamento.ler("teste", []).length', blocked), 0);
  assert.doesNotThrow(() => vm.runInContext('armazenamento.salvar("teste", [])', blocked));
  return `${cases.length + 2} verificações de armazenamento passaram.`;
}

console.log(runStorageTests());
