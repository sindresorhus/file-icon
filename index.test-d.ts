import {expectType} from 'tsd';
import {file, buffer} from '.';

expectType<Buffer>(await buffer('input'));
expectType<Buffer[]>(await buffer(['input', 'input2']));

expectType<void>(await file('input', {destination: 'output'}));
expectType<void>(await file(['input', 'input2'], {destination: ['output', 'output2']}));
