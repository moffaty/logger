import {expect} from 'chai';
import Logger from '../logger.mjs';
import fs from 'fs';
import { join } from 'path';
const logger = new Logger();

// Определяем тестовые сценарии с помощью describe и it
describe('Array', function() {
    describe('Custom auth.csv logger', function() {
        it('Create logs dir', function() {
            expect(fs.statSync(logger.logDir));
        });
        it('Create auth.csv', async function() {
            await logger.custom('auth.csv');
            await logger.auth('123');
            expect(fs.statSync(join(logger.logDir, logger.date, 'auth.csv')));
        });
        it('Create a12uth.csv', async function() {
            await logger.custom('a12uth.csv');
            await logger.a12uth('aaAA');
            expect(fs.statSync(join(logger.logDir, logger.date, 'a12uth.csv')));
        });
        it('Add to a12uth new method with different name', async function() {
            try {
                await logger.custom('a12uth.csv', 'newauth');
                await logger.newauth('newauth');
                expect (true);
            }
            catch (err) {
                expect(false);
            }
        });
        it('Stop logger', function() {
            logger.stop();
            expect(logger.update === false);
        })
    });
});