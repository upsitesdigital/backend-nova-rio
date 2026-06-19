export interface UnitAddressParts {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

export class UnitAddressComposer {
  static compose(parts: UnitAddressParts): string | null {
    const streetLine = UnitAddressComposer.join([parts.street, parts.number], ', ');
    const localityLine = UnitAddressComposer.join([streetLine, parts.neighborhood], ' - ');
    const cityLine = UnitAddressComposer.join([parts.city, parts.state], ' - ');
    const composed = UnitAddressComposer.join([localityLine, cityLine, parts.cep], ', ');

    return composed.length > 0 ? composed : null;
  }

  private static join(values: Array<string | undefined>, separator: string): string {
    return values
      .map((value) => value?.trim())
      .filter((value) => !!value)
      .join(separator);
  }
}
