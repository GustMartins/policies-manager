
/**
 * Efeitos da polícia: permitir ou negar ações
 */
export enum Effects {
  Allow = 'Allow',
  Deny = 'Deny'
}

/**
 * Condições padrão para validação de políticas
 */
export enum Conditions {
  Not = 'not',
  Equals = 'equals',
  NotEquals = 'not-equals',
  StartsWith = 'starts-with',
  Contains = 'contains'
}

/**
 * Condição do tipo 'contains' necessitam que a(s) propriedade(s) especificadas sejam
 * um array de dados
 */
export interface ContainsCondition {
  condition: Conditions.Contains,
  context: Record<string, any[]>
}

/**
 * Condições, com exceção do tipo 'contains', podem ter qualquer tipo de valor em suas
 * propriedades
 */
export interface OtherCondition {
  condition: Exclude<Conditions, Conditions.Contains>,
  context: Record<string, any>
}

/**
 * Uma condição de política limita a aplicação da política à qual ela está aplicada com
 * base em um contexto adicional fornecido.
 *
 * Por exemplo, você poderia definir que um sujeito poderia executar todas as ações de
 * determinado recurso e condicionar que o sujeito deve ser o proprietário do recurso para
 * executar a ação.
 *
 * Se múltiplas condições forem fornecidas em uma mesma regra, todas devem ser válidas
 * ("e"). No momento não há um tipo de agrupamento com "ou".
 */
export type Condition = ContainsCondition | OtherCondition

/**
 * Políticas definem as ações que um sujeito pode exercer em um determinado recurso
 */
export interface Policy {

  /**
   * Identificador opcional para a política
   * Esse identificador não afeta o funcionamento da política, apenas serve para facilitar
   * o uso das políticas por parte das aplicações.
   */
  id?: string

  /**
   * Esta política permite ou nega as ações no recurso?
   */
  effect: Effects

  /**
   * Quais ações são permitidas ou negadas nesta política?
   */
  actions: readonly string[]

  /**
   * Quais recursos esta política permite ou nega?
   */
  resources: readonly string[]

  /**
   * Quais as condições para permitir ou negar esta política?
   */
  conditions?: Condition[]
}

/**
 * Papel 'role' utilizado para agrupar políticas sobre um único identificador
 */
export interface Role {
  id: string
  policies: readonly Policy[]
}

/**
 * Um sujeito terá um ou mais papéis associados a ele.
 * Um contexto também pode ser fornecido para melhor validar as políticas associadas aos
 * papéis do sujeito.
 */
export interface RoleClaim {

  /**
   * O id to papel em questão
   */
  id: string

  /**
   * Contexto opcional. Se fornecido será usado para validar a política
   */
  context?: Record<string, any>
}

/**
 * Um conjunto de solicitações representando o que um sujeito pode realizar
 */
export interface Claims {

  /**
   * 'subject' pode ser qualquer string utilizada para representar um usuário de sua
   * aplicação.
   */
  subject: string

  /**
   * 'RoleClaim' garante acesso do usuário aos papéis. Eles constroem todo o conjunto de
   * políticas e permissões que o usuário necessita.
   */
  roles: RoleClaim[]
}

/**
 * Opções disponíveis para o método `isAllowed()` de `IClaimer`
 */
export interface isAllowedOptions {
  context: Record<string, any>
}

/**
 * Um IClaimer é utilizado para determinar as ações que cada sujeito pode realizar.
 */
export interface IClaimer {

  /**
   * Verifica se o sujeito está autorizado a executar esta ação neste recurso.
   * Opcionalmente pode-se adicionar um contexto para validar uma política.
   */
  isAllowed(action: string, resource: string, options?: Partial<isAllowedOptions>): boolean
}

/**
 * Um IAuthorizer é carregado com todos os papéis necessários para a plataforma.
 */
export interface IAuthorizer {

  /**
   * Utilizando o conjunto de solicitações de um sujeito e os papéis disponíveis na
   * plataforma este método gera um a claimer para o sujeito.
   */
  generateClaimerForSubject(claims: Claims): IClaimer
}
