'use client';

import {
  Bold,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

type PublicationRichTextEditorProps = {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (
    value: string,
  ) => void;
};

type TextSize =
  | 'small'
  | 'normal'
  | 'large'
  | 'xlarge';

const TEXT_SIZE_COMMANDS: Record<
  TextSize,
  string
> = {
  small: '2',
  normal: '3',
  large: '4',
  xlarge: '5',
};

const TEXT_SIZE_CLASSES: Record<
  string,
  string
> = {
  '2':
    'publication-text--small',

  '3':
    'publication-text--normal',

  '4':
    'publication-text--large',

  '5':
    'publication-text--xlarge',
};

const ALLOWED_TEXT_SIZE_CLASSES =
  Object.values(
    TEXT_SIZE_CLASSES,
  );

function escapeHtml(
  value: string,
) {
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
    )
    .replaceAll(
      "'",
      '&#039;',
    );
}

function convertPlainTextToHtml(
  value: string,
) {
  const trimmedValue =
    value.trim();

  if (!trimmedValue) {
    return '';
  }

  if (
    /<\/?[a-z][\s\S]*>/i.test(
      trimmedValue,
    )
  ) {
    return trimmedValue;
  }

  return trimmedValue
    .split(
      /\n{2,}/,
    )
    .map(
      paragraph =>
        `<p>${escapeHtml(
          paragraph,
        ).replaceAll(
          '\n',
          '<br>',
        )}</p>`,
    )
    .join('');
}

function normalizeEditorHtml(
  editor: HTMLElement,
) {
  const clonedEditor =
    editor.cloneNode(
      true,
    ) as HTMLElement;

  clonedEditor
    .querySelectorAll(
      'font',
    )
    .forEach(
      fontElement => {
        const size =
          fontElement.getAttribute(
            'size',
          ) ?? '3';

        const replacement =
          document.createElement(
            'span',
          );

        replacement.className =
          TEXT_SIZE_CLASSES[
            size
          ] ??
          TEXT_SIZE_CLASSES[
            '3'
          ];

        replacement.innerHTML =
          fontElement.innerHTML;

        fontElement.replaceWith(
          replacement,
        );
      },
    );

  clonedEditor
    .querySelectorAll(
      '[style]',
    )
    .forEach(
      element => {
        element.removeAttribute(
          'style',
        );
      },
    );

  clonedEditor
    .querySelectorAll(
      '[class]',
    )
    .forEach(
      element => {
        if (
          element.tagName !==
          'SPAN'
        ) {
          element.removeAttribute(
            'class',
          );

          return;
        }

        const allowedClass =
          Array.from(
            element.classList,
          ).find(
            className =>
              ALLOWED_TEXT_SIZE_CLASSES.includes(
                className,
              ),
          );

        if (!allowedClass) {
          element.removeAttribute(
            'class',
          );

          return;
        }

        element.className =
          allowedClass;
      },
    );

  clonedEditor
    .querySelectorAll(
      'span:not([class])',
    )
    .forEach(
      spanElement => {
        spanElement.replaceWith(
          ...Array.from(
            spanElement.childNodes,
          ),
        );
      },
    );

  const normalizedHtml =
    clonedEditor.innerHTML
      .replace(
        /<div><br><\/div>/gi,
        '<p><br></p>',
      )
      .replace(
        /<div>/gi,
        '<p>',
      )
      .replace(
        /<\/div>/gi,
        '</p>',
      )
      .replace(
        /<b>/gi,
        '<strong>',
      )
      .replace(
        /<\/b>/gi,
        '</strong>',
      )
      .replace(
        /<i>/gi,
        '<em>',
      )
      .replace(
        /<\/i>/gi,
        '</em>',
      )
      .replace(
        /<p>\s*<\/p>/gi,
        '',
      )
      .trim();

  return normalizedHtml ===
    '<br>'
    ? ''
    : normalizedHtml;
}

function selectionBelongsToEditor(
  selection: Selection,
  editor: HTMLElement,
) {
  if (
    selection.rangeCount ===
    0
  ) {
    return false;
  }

  const range =
    selection.getRangeAt(
      0,
    );

  return (
    editor.contains(
      range.commonAncestorContainer,
    ) ||
    range.commonAncestorContainer ===
      editor
  );
}

export function PublicationRichTextEditor({
  value,
  disabled = false,
  placeholder =
    'Rédigez le contenu de la publication…',
  onChange,
}: PublicationRichTextEditorProps) {
  const editorRef =
    useRef<HTMLDivElement>(
      null,
    );

  const savedRangeRef =
    useRef<Range | null>(
      null,
    );

  const latestValueRef =
    useRef(
      value,
    );

  useEffect(
    () => {
      const editor =
        editorRef.current;

      if (!editor) {
        return;
      }

      const normalizedValue =
        convertPlainTextToHtml(
          value,
        );

      if (
        editor.innerHTML !==
        normalizedValue
      ) {
        editor.innerHTML =
          normalizedValue;
      }

      latestValueRef.current =
        normalizedValue;
    },
    [
      value,
    ],
  );

  const saveSelection =
    useCallback(
      () => {
        const editor =
          editorRef.current;

        const selection =
          window.getSelection();

        if (
          !editor ||
          !selection ||
          !selectionBelongsToEditor(
            selection,
            editor,
          )
        ) {
          return;
        }

        savedRangeRef.current =
          selection
            .getRangeAt(
              0,
            )
            .cloneRange();
      },
      [],
    );

  const restoreSelection =
    useCallback(
      () => {
        const editor =
          editorRef.current;

        if (
          !editor ||
          !savedRangeRef.current
        ) {
          return false;
        }

        editor.focus();

        const selection =
          window.getSelection();

        if (!selection) {
          return false;
        }

        selection.removeAllRanges();

        selection.addRange(
          savedRangeRef.current,
        );

        return true;
      },
      [],
    );

  const emitChange =
    useCallback(
      () => {
        const editor =
          editorRef.current;

        if (!editor) {
          return;
        }

        const normalizedHtml =
          normalizeEditorHtml(
            editor,
          );

        if (
          editor.innerHTML !==
          normalizedHtml
        ) {
          editor.innerHTML =
            normalizedHtml;
        }

        latestValueRef.current =
          normalizedHtml;

        onChange(
          normalizedHtml,
        );
      },
      [
        onChange,
      ],
    );

  const executeCommand =
    useCallback(
      (
        command: string,
        commandValue?: string,
      ) => {
        if (disabled) {
          return;
        }

        const editor =
          editorRef.current;

        if (!editor) {
          return;
        }

        const selectionRestored =
          restoreSelection();

        if (
          !selectionRestored
        ) {
          editor.focus();
        }

        document.execCommand(
          command,
          false,
          commandValue,
        );

        saveSelection();
        emitChange();
      },
      [
        disabled,
        emitChange,
        restoreSelection,
        saveSelection,
      ],
    );

  const applyBold =
    useCallback(
      () => {
        executeCommand(
          'bold',
        );
      },
      [
        executeCommand,
      ],
    );

  const applyTextSize =
    useCallback(
      (
        textSize: TextSize,
      ) => {
        executeCommand(
          'fontSize',
          TEXT_SIZE_COMMANDS[
            textSize
          ],
        );
      },
      [
        executeCommand,
      ],
    );

  const insertPlainText =
    useCallback(
      (
        plainText: string,
      ) => {
        const inserted =
          document.execCommand(
            'insertText',
            false,
            plainText,
          );

        if (inserted) {
          return;
        }

        const selection =
          window.getSelection();

        if (
          !selection ||
          selection.rangeCount ===
            0
        ) {
          return;
        }

        const range =
          selection.getRangeAt(
            0,
          );

        range.deleteContents();

        const textNode =
          document.createTextNode(
            plainText,
          );

        range.insertNode(
          textNode,
        );

        range.setStartAfter(
          textNode,
        );

        range.collapse(
          true,
        );

        selection.removeAllRanges();

        selection.addRange(
          range,
        );
      },
      [],
    );

  const editorIsEmpty =
    value.trim().length ===
    0;

  return (
    <div
      className="publication-rich-text"
      data-disabled={
        disabled
          ? 'true'
          : 'false'
      }
    >
      <div
        className="publication-rich-text__toolbar"
        role="toolbar"
        aria-label="Mise en forme du contenu"
      >
        <button
          type="button"
          className="publication-rich-text__button"
          disabled={
            disabled
          }
          aria-label="Mettre le texte sélectionné en gras"
          title="Gras"
          onMouseDown={
            event => {
              event.preventDefault();

              restoreSelection();
            }
          }
          onClick={
            applyBold
          }
        >
          <Bold
            size={
              18
            }
            aria-hidden="true"
          />

          <span>
            Gras
          </span>
        </button>

        <label className="publication-rich-text__size-field">
          <span>
            Taille
          </span>

          <select
            defaultValue="normal"
            disabled={
              disabled
            }
            aria-label="Modifier la taille du texte sélectionné"
            onMouseDown={
              () => {
                saveSelection();
              }
            }
            onChange={
              event => {
                applyTextSize(
                  event.target
                    .value as TextSize,
                );

                event.target.value =
                  'normal';
              }
            }
          >
            <option value="small">
              Petite
            </option>

            <option value="normal">
              Normale
            </option>

            <option value="large">
              Grande
            </option>

            <option value="xlarge">
              Très grande
            </option>
          </select>
        </label>
      </div>

      <div className="publication-rich-text__editor-wrapper">
        {
          editorIsEmpty
            ? (
                <div
                  className="publication-rich-text__placeholder"
                  aria-hidden="true"
                >
                  {
                    placeholder
                  }
                </div>
              )
            : null
        }

        <div
          ref={
            editorRef
          }
          className="publication-rich-text__editor"
          contentEditable={
            !disabled
          }
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Contenu de la publication"
          spellCheck
          onInput={
            () => {
              saveSelection();
              emitChange();
            }
          }
          onKeyUp={
            saveSelection
          }
          onMouseUp={
            saveSelection
          }
          onFocus={
            saveSelection
          }
          onBlur={
            () => {
              saveSelection();
              emitChange();
            }
          }
          onPaste={
            event => {
              event.preventDefault();

              const plainText =
                event.clipboardData.getData(
                  'text/plain',
                );

              insertPlainText(
                plainText,
              );

              saveSelection();
              emitChange();
            }
          }
        />
      </div>

      <small className="publication-rich-text__help">
        Sélectionnez un texte avant d’appliquer le gras ou une taille.
        La mise en forme est enregistrée séparément pour chaque langue.
      </small>
    </div>
  );
}