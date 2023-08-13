import { AIResponseType, AIResponseTypeEnum } from '@/types/provider'
import { AIProvider } from './base'
import { consoleLog, LogLevelEnum } from '@/utils'
import { ofetch } from 'ofetch'
import { uuid } from '@/utils'

export class Bard extends AIProvider {
  public isProcessing: boolean = false
  private apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  public closeStream = () => {}
  public deleteConversation(conversationId: string): void {}

  private async generateReqId() {
    return Math.floor(Math.random() * 900000) + 100000
  }

  private extractFromHTML(variableName: string, html: string) {
    const regex = new RegExp(`"${variableName}":"([^"]+)"`)
    const match = regex.exec(html)
    return match?.[1]
  }

  private async fetchRequestParams() {
    const html = await ofetch('https://bard.google.com', {
      method: 'GET',
    })
    const atValue = this.extractFromHTML('SNlM0e', html)
    const blValue = this.extractFromHTML('cfb2h', html)

    fetch('https://bard.google.com', {
      method: 'GET',
      headers: {
        Origin: 'https://bard.google.com',
        'Access-Control-Allow-Origin': 'https://bard.google.com',
      },
    })
      .then((response) => response.text())
      .then((data) => console.log(data))
      .catch((error) => console.error('Có lỗi xảy ra:', error))

    return { atValue, blValue }
  }

  async conversation(
    conversationId: string | null,
    messageId: string | null,
    prompt: string,
    isStream: boolean,
    args: any,
  ): Promise<(callback: (data: AIResponseType) => void) => void> {
    return new Promise<(callback: (data: AIResponseType) => void) => void>((resolve, reject) => {
      resolve(async (callback: (data: AIResponseType) => void) => {
        consoleLog(LogLevelEnum.DEBUG, prompt)

        const requestParams = await this.fetchRequestParams()
        consoleLog(LogLevelEnum.DEBUG, requestParams)

        const contextIds = ['', '', '']
        const resp = await ofetch(
          'https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
          {
            method: 'POST',
            query: {
              bl: requestParams.blValue,
              _reqid: this.generateReqId(),
              rt: 'c',
            },
            headers: {
              Origin: 'https://bard.google.com', // Thay your_domain_here bằng domain của trang web của bạn
              'Access-Control-Allow-Origin': 'https://bard.google.com', // Thay origin_allowed_here bằng domain mà bạn muốn cho phép truy cập
              // Các headers khác cần thiết cũng nên được thêm vào đây
            },
            body: new URLSearchParams({
              at: requestParams.atValue!,
              'f.req': JSON.stringify([
                null,
                `[[${JSON.stringify(prompt)}],null,${JSON.stringify(contextIds)}]`,
              ]),
            }),
            parseResponse: (txt) => txt,
          },
        )
        consoleLog(LogLevelEnum.DEBUG, resp)

        callback({
          type: AIResponseTypeEnum.MESSAGE,
          message: 'Hello Bard',
        })

        callback({
          type: AIResponseTypeEnum.COMPLETE,
          message: 'Final message Bard',
        })
      })
    })
  }
}
