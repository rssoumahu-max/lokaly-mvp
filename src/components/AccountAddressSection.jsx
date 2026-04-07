import React from 'react';
import { THEME } from '../constants/theme';

export default function AccountAddressSection({
  language,
  profile,
  openKey,
  setOpenKey,
  address1Draft,
  setAddress1Draft,
  houseNumberDraft,
  setHouseNumberDraft,
  address2Draft,
  setAddress2Draft,
  postalDraft,
  setPostalDraft,
  cityDraft,
  setCityDraft,
  countryDraft,
  setCountryDraft,
  geoError,
  savingAddress,
  address1Ref,
  editorWrap,
  input,
  btnRow,
  btnGhost,
  btnPrimary,
  onSaveAddress,
}) {
  const help = {
    marginTop: 2,
    fontFamily: THEME.font,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: 'rgba(255,255,255,0.6)',
  };

  if (openKey !== 'address') return null;

  return (
    <div style={editorWrap}>
      <input
        ref={address1Ref}
        style={input}
        value={address1Draft}
        onChange={(e) => setAddress1Draft(e.target.value)}
        placeholder={language === 'nl' ? 'Straatnaam' : 'Street'}
      />

      <div style={{ height: 10 }} />

      <input
        style={input}
        value={houseNumberDraft}
        onChange={(e) => setHouseNumberDraft(e.target.value)}
        placeholder={language === 'nl' ? 'Huisnummer' : 'House number'}
      />

      <div style={{ height: 10 }} />

      <input
        style={input}
        value={address2Draft}
        onChange={(e) => setAddress2Draft(e.target.value)}
        placeholder={
          language === 'nl' ? 'Toevoeging (optioneel)' : 'Line 2 (optional)'
        }
      />

      <div style={{ height: 10 }} />

      <input
        style={input}
        value={postalDraft}
        onChange={(e) => setPostalDraft(e.target.value)}
        placeholder={language === 'nl' ? 'Postcode' : 'Postal code'}
      />

      <div style={{ height: 10 }} />

      <input
        style={input}
        value={cityDraft}
        onChange={(e) => setCityDraft(e.target.value)}
        placeholder={language === 'nl' ? 'Woonplaats' : 'City'}
      />

      <div style={{ height: 10 }} />

      <input
        style={input}
        value={countryDraft}
        onChange={(e) => setCountryDraft(e.target.value)}
        placeholder={
          language === 'nl' ? 'Landcode (bijv. NL)' : 'Country code (e.g. NL)'
        }
      />

      {geoError ? (
        <div style={{ ...help, color: 'rgba(255,107,61,0.95)', marginTop: 10 }}>
          {geoError}
        </div>
      ) : null}

      <div style={btnRow}>
        <button
          type="button"
          style={btnGhost}
          onClick={() => {
            setAddress1Draft(profile?.address_line1 || '');
            setHouseNumberDraft(profile?.house_number || '');
            setAddress2Draft(profile?.address_line2 || '');
            setPostalDraft(profile?.postal_code || '');
            setCityDraft(profile?.city || '');
            setCountryDraft(profile?.country_code || 'NL');
            setOpenKey(null);
          }}
        >
          {language === 'nl' ? 'Annuleer' : 'Cancel'}
        </button>

        <button
          type="button"
          style={{
            ...btnPrimary,
            opacity: savingAddress ? 0.7 : 1,
          }}
          disabled={savingAddress}
          onClick={onSaveAddress}
        >
          {savingAddress
            ? language === 'nl'
              ? 'Opslaan...'
              : 'Saving...'
            : language === 'nl'
            ? 'Opslaan'
            : 'Save'}
        </button>
      </div>
    </div>
  );
}
