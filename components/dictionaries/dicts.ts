
/**
 * If an option is of `string` type there will be an array
 * of options in `options_sel` field.
 */
export type DictItem<
  Options extends
    | { [option: string]: number | boolean | string }
    | undefined = undefined,
  Key extends keyof Options = Options extends undefined ? never : keyof Options
> = Options extends undefined
  ? DictItemWithOptions
  : DictItemWithOptions<Options> &
      ((Key extends any
        ? Options[Key] extends string
          ? Key
          : never
        : never) extends never
        ? {}
        : {
            options_sel: {
              [opt in Key extends any
                ? Options[Key] extends string
                  ? Key
                  : never
                : never]: Options[opt][]
            }
          })
