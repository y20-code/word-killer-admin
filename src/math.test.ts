import { test,expect } from 'vitest';
import { add } from './math'

test('第一次无力测算:1+1必须等于 2',() =>{
    expect(add(1,1)).toBe(2);
})