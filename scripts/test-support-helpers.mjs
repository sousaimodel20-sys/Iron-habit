import assert from 'node:assert/strict';
import {
  buildSupportSmsHref,
  buildSupportTelHref,
  cleanSupportPhone,
  getSupportContactLabel,
  hasSupportContact,
} from '../src/utils/support.ts';

const blankProfile = { supportName: '', supportPhone: '', supportLocation: '' };
const profile = { supportName: 'Brother Mike', supportPhone: '(604) 555-1234', supportLocation: 'Burnaby, BC' };
const intlProfile = { supportName: '', supportPhone: '+1 604.555.9876', supportLocation: 'Vancouver, BC' };

assert.equal(cleanSupportPhone(profile.supportPhone), '6045551234');
assert.equal(cleanSupportPhone(intlProfile.supportPhone), '+16045559876');
assert.equal(hasSupportContact(blankProfile), false);
assert.equal(hasSupportContact(profile), true);
assert.equal(getSupportContactLabel(blankProfile), 'safe person');
assert.equal(getSupportContactLabel(profile), 'Brother Mike');
assert.equal(buildSupportTelHref(profile), 'tel:6045551234');
assert.equal(buildSupportSmsHref(profile, 'I need help now.'), 'sms:6045551234?&body=I%20need%20help%20now.');
assert.equal(buildSupportSmsHref(blankProfile, 'I need help now.'), 'sms:?body=I%20need%20help%20now.');

console.log('support helper tests passed');
