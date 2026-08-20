import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import type {
  CreateContactRequestDto,
} from '../contact-requests/dto/create-contact-request.dto';

import type {
  CreateProductRequestDto,
} from '../product-requests/dto/create-product-request.dto';

type NewContactRequestNotification = {
  id:
    string;

  createdAt:
    Date;

  contact:
    CreateContactRequestDto;
};

type NewProductRequestNotification = {
  id:
    string;

  createdAt:
    Date;

  productName:
    string;

  request:
    CreateProductRequestDto;
};

@Injectable()
export class TelegramNotificationService {
  private readonly logger =
    new Logger(
      TelegramNotificationService.name,
    );

  constructor(
    private readonly configService:
      ConfigService,
  ) {}

  /*
   * =========================================================
   * CONTACT REQUEST
   * =========================================================
   */

  async notifyNewContactRequest(
    notification:
      NewContactRequestNotification,
  ): Promise<void> {
    const message =
      this.buildNewContactRequestMessage(
        notification,
      );

    await this.sendMessage(
      message,
      `demande de contact ${notification.id}`,
    );
  }

  /*
   * =========================================================
   * PRODUCT REQUEST
   * =========================================================
   */

  async notifyNewProductRequest(
    notification:
      NewProductRequestNotification,
  ): Promise<void> {
    const message =
      this.buildNewProductRequestMessage(
        notification,
      );

    await this.sendMessage(
      message,
      `demande produit ${notification.id}`,
    );
  }

  /*
   * =========================================================
   * SEND
   * =========================================================
   */
private async sendMessage(
  message:
    string,

  context:
    string,
): Promise<void> {
  if (
    !this.isEnabled()
  ) {
    return;
  }

  const botToken =
    this.configService.get<string>(
      'TELEGRAM_BOT_TOKEN',
    );

  const chatIds =
    this.getChatIds();

  if (
    !botToken
  ) {
    this.logger.warn(
      'Les notifications Telegram sont activées mais TELEGRAM_BOT_TOKEN est manquant.',
    );

    return;
  }

  if (
    chatIds.length ===
    0
  ) {
    this.logger.warn(
      'Les notifications Telegram sont activées mais aucun destinataire n’est configuré dans TELEGRAM_CHAT_IDS.',
    );

    return;
  }

  const endpoint =
    `https://api.telegram.org/bot${botToken}/sendMessage`;

  const results =
    await Promise.allSettled(
      chatIds.map(
        (
          chatId,
        ) =>
          this.sendMessageToChat(
            endpoint,
            chatId,
            message,
            context,
          ),
      ),
    );

  const successfulDeliveries =
    results.filter(
      (
        result,
      ) =>
        result.status ===
        'fulfilled',
    ).length;

  if (
    successfulDeliveries >
    0
  ) {
    this.logger.log(
      `Notification Telegram envoyée pour ${context} à ${successfulDeliveries}/${chatIds.length} destinataire(s).`,
    );
  }
}

  /*
   * =========================================================
   * CONTACT MESSAGE
   * =========================================================
   */

private async sendMessageToChat(
  endpoint:
    string,

  chatId:
    string,

  message:
    string,

  context:
    string,
): Promise<void> {
  try {
    const response =
      await fetch(
        endpoint,
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify({
              chat_id:
                chatId,

              text:
                message,

              parse_mode:
                'HTML',

              disable_web_page_preview:
                true,
            }),

          signal:
            AbortSignal.timeout(
              5000,
            ),
        },
      );

    if (
      !response.ok
    ) {
      const responseBody =
        await response
          .text()
          .catch(
            () =>
              '',
          );

      this.logger.error(
        `Telegram a refusé la notification pour ${context} vers le chat ${chatId}. HTTP ${response.status}. ${responseBody}`,
      );

      throw new Error(
        `Telegram HTTP ${response.status}`,
      );
    }
  } catch (
    error
  ) {
    const errorMessage =
      error instanceof
      Error
        ? error.message
        : String(
            error,
          );

    this.logger.error(
      `Impossible d'envoyer la notification Telegram pour ${context} vers le chat ${chatId}: ${errorMessage}`,
    );

    throw error;
  }
}  

  private buildNewContactRequestMessage(
    notification:
      NewContactRequestNotification,
  ): string {
    const {
      contact,
      createdAt,
      id,
    } =
      notification;

    const source =
      this.formatContactSource(
        contact.source,
      );

    const appointment =
      contact.wantsAppointment
        ? 'Oui'
        : 'Non';

    const adminUrl =
      this.buildAdminUrl(
        '/admin/contact-requests',
      );

    const lines = [
      '🔔 <b>Nouvelle demande de contact</b>',
      '',
      `👤 <b>${this.escapeHtml(contact.firstName)} ${this.escapeHtml(contact.lastName)}</b>`,
      `🏢 ${this.escapeHtml(contact.companyName)}`,
      `💼 ${this.escapeHtml(contact.jobTitle)}`,
      '',
      `📧 <b>Email :</b> ${this.escapeHtml(contact.email)}`,
      `📞 <b>Téléphone :</b> ${this.escapeHtml(contact.phoneNumber)}`,
      '',
      `🌐 <b>Langue :</b> ${this.escapeHtml(contact.locale.toUpperCase())}`,
      `📍 <b>Source :</b> ${this.escapeHtml(source)}`,
      `📅 <b>Rendez-vous souhaité :</b> ${appointment}`,
      '',
      '📝 <b>Besoin :</b>',
      this.escapeHtml(
        contact.needDescription,
      ),
      '',
      `🕒 ${this.escapeHtml(this.formatDate(createdAt))}`,
      `🆔 <code>${this.escapeHtml(id)}</code>`,
    ];

    if (
      adminUrl
    ) {
      lines.push(
        '',
        `🔗 <a href="${this.escapeHtml(adminUrl)}">Ouvrir dans l’administration</a>`,
      );
    }

    return lines.join(
      '\n',
    );
  }

  /*
   * =========================================================
   * PRODUCT MESSAGE
   * =========================================================
   */

  private buildNewProductRequestMessage(
    notification:
      NewProductRequestNotification,
  ): string {
    const {
      createdAt,
      id,
      productName,
      request,
    } =
      notification;

    const requestPresentation =
      this.getProductRequestPresentation(
        request.requestType,
      );

    const adminUrl =
      this.buildAdminUrl(
        '/admin/product-requests',
      );

    const lines = [
      `${requestPresentation.icon} <b>${requestPresentation.title}</b>`,
      '',
      `📦 <b>Produit :</b> ${this.escapeHtml(productName)}`,
      `🏷️ <b>Type :</b> ${this.escapeHtml(requestPresentation.label)}`,
      '',
      `👤 <b>${this.escapeHtml(
        [request.firstName, request.lastName]
          .filter(
            (
              value,
            ): value is string =>
              Boolean(
                value,
              ),
          )
          .join(
            ' ',
          ) ||
          request.companyName ||
          request.email,
      )}</b>`,
    ];

    if (
      request.companyName
    ) {
      lines.push(
        `🏢 ${this.escapeHtml(request.companyName)}`,
      );
    }

    lines.push(
      '',
      `📧 <b>Email :</b> ${this.escapeHtml(request.email)}`,
    );

    if (
      request.phoneNumber
    ) {
      lines.push(
        `📞 <b>Téléphone :</b> ${this.escapeHtml(request.phoneNumber)}`,
      );
    }

    lines.push(
      '',
      `🌐 <b>Langue :</b> ${this.escapeHtml(request.locale.toUpperCase())}`,
    );

    if (
      request.sourceUrl
    ) {
      lines.push(
        `🌍 <b>Page source :</b> ${this.escapeHtml(request.sourceUrl)}`,
      );
    }

    lines.push(
      '',
      '📝 <b>Demande :</b>',
      this.escapeHtml(
        request.message,
      ),
      '',
      `🕒 ${this.escapeHtml(this.formatDate(createdAt))}`,
      `🆔 <code>${this.escapeHtml(id)}</code>`,
    );

    if (
      adminUrl
    ) {
      lines.push(
        '',
        `🔗 <a href="${this.escapeHtml(adminUrl)}">Ouvrir dans l’administration</a>`,
      );
    }

    return lines.join(
      '\n',
    );
  }

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */
  
private getChatIds():
  string[] {
  const value =
    this.configService.get<string>(
      'TELEGRAM_CHAT_IDS',
    );

  if (
    !value
  ) {
    return [];
  }

  return [
    ...new Set(
      value
        .split(',')
        .map(
          (
            chatId,
          ) =>
            chatId.trim(),
        )
        .filter(
          Boolean,
        ),
    ),
  ];
}

  private isEnabled():
    boolean {
    const value =
      this.configService.get<string>(
        'TELEGRAM_NOTIFICATIONS_ENABLED',
      );

    return [
      'true',
      '1',
      'yes',
      'on',
    ].includes(
      (
        value ??
        ''
      )
        .trim()
        .toLowerCase(),
    );
  }

  private buildAdminUrl(
    pathname:
      string,
  ): string | null {
    const frontendUrl =
      this.configService.get<string>(
        'FRONTEND_PUBLIC_URL',
      );

    if (
      !frontendUrl
    ) {
      return null;
    }

    return `${frontendUrl.replace(/\/+$/, '')}${pathname}`;
  }

  private formatContactSource(
    source:
      string,
  ): string {
    switch (
      source
    ) {
      case 'CONTACT_PAGE':
        return 'Page contact';

      case 'ASSIST_PAGE':
        return 'Assistant';

      default:
        return source;
    }
  }

  private getProductRequestPresentation(
    requestType:
      string,
  ): {
    icon:
      string;

    title:
      string;

    label:
      string;
  } {
    switch (
      requestType
    ) {
      case 'DEMO':
        return {
          icon:
            '🎯',

          title:
            'Nouvelle demande de démonstration',

          label:
            'Démonstration',
        };

      case 'ORDER':
        return {
          icon:
            '🛒',

          title:
            'Nouvelle commande produit',

          label:
            'Commande',
        };

      case 'CONTACT':
      default:
        return {
          icon:
            '💬',

          title:
            'Nouvelle demande concernant un produit',

          label:
            'Contact',
        };
    }
  }

  private formatDate(
    date:
      Date,
  ): string {
    try {
      return new Intl.DateTimeFormat(
        'fr-FR',
        {
          dateStyle:
            'medium',

          timeStyle:
            'short',

          timeZone:
            'Africa/Casablanca',
        },
      ).format(
        date,
      );
    } catch {
      return date
        .toISOString();
    }
  }

  private escapeHtml(
    value:
      string,
  ): string {
    return value
      .replaceAll(
        '&',
        '&amp;',
      )
      .replaceAll(
        '<',
        '&lt;',
      )
      .replaceAll(
        '>',
        '&gt;',
      )
      .replaceAll(
        '"',
        '&quot;',
      );
  }
}