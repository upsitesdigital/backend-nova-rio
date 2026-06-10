export class CepUtil {
  private static readonly cepPattern = /\b\d{5}-?\d{3}\b/;

  static normalize(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  static extractFromText(text: string): string | null {
    const match = text.match(CepUtil.cepPattern);
    if (!match) {
      return null;
    }
    return CepUtil.normalize(match[0]);
  }
}
