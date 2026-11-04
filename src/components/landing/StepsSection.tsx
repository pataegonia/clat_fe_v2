'use client'

import { Fragment } from 'react'
import StepMediaView from '@/components/landing/StepMediaView'
import { steps } from '@/lib/landing-content'
import * as s from '@/app/steps-figma.css'

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function SoftTitle({
  id,
  title,
  className,
}: {
  id: string
  title: string
  className: string
}) {
  const lines = title.split('\n')
  return (
    <h3 id={id} className={className}>
      {lines.map((line, index) => (
        <Fragment key={`${id}-${index}`}>
          {index > 0 ? (
            <>
              <br className={s.stepTitleBreak} />
              <span className={s.stepTitleSoftSpace}> </span>
            </>
          ) : null}
          {line}
        </Fragment>
      ))}
    </h3>
  )
}

export default function StepsSection() {
  return (
    <div id="steps" className={s.stepsFigmaRoot}>
      <header className={s.stepsIntro}>
        <p className={s.stepsIntroEyebrow}>사용법</p>
        <h2 className={s.stepsIntroTitle}>가입 후, 이 순서만 따라가면 끝이에요</h2>
        <p className={s.stepsIntroLead}>
          처음 한 번만 세팅하면 이후 수업마다 기록·문자·추적이 자동으로 이어집니다.
        </p>
      </header>

      {steps.map((step) => {
        const textSide = step.textSide ?? 'right'
        const isParent = Boolean(step.notes?.length)

        return (
          <section
            key={step.id}
            className={cx(
              s.stepFigmaSlide,
              step.tone === 'tint' ? s.stepFigmaSlideTint : s.stepFigmaSlideWhite,
            )}
            aria-labelledby={`${step.id}-title`}
          >
            {step.ellipseSide ? (
              <img
                src="/images/steps/ellipse.svg"
                alt=""
                className={cx(
                  s.stepFigmaEllipse,
                  step.ellipseSide === 'left'
                    ? s.stepFigmaEllipseLeft
                    : s.stepFigmaEllipseRight,
                )}
                aria-hidden
              />
            ) : null}

            <div
              className={cx(
                s.stepFigmaInner,
                textSide === 'left' && s.stepFigmaInnerTextLeft,
                isParent && s.stepFigmaInnerParent,
              )}
            >
              <div
                className={cx(
                  s.stepFigmaMedia,
                  textSide === 'left' ? s.stepFigmaMediaOrder2 : s.stepFigmaMediaOrder1,
                )}
              >
                <StepMediaView media={step.media} />
              </div>

              <div
                className={cx(
                  s.stepFigmaCopy,
                  textSide === 'left' ? s.stepFigmaCopyOrder1 : s.stepFigmaCopyOrder2,
                )}
              >
                {isParent && step.notes ? (
                  <div className={s.stepParentNotes}>
                    <div className={s.stepFigmaMeta}>
                      <span className={s.stepFigmaBadge}>{step.step}</span>
                      {step.tab ? <span className={s.stepFigmaTab}>{step.tab}</span> : null}
                    </div>
                    <SoftTitle
                      id={`${step.id}-title`}
                      title={step.title}
                      className={s.stepFigmaTitle}
                    />
                    {step.notes.map((note) => (
                      <article key={note.step} className={s.stepParentNote}>
                        <span className={s.stepFigmaBadge}>{note.step}</span>
                        <h4 className={s.stepParentNoteTitle}>{note.title}</h4>
                        <p className={s.stepParentNoteDesc}>{note.body}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className={s.stepFigmaMeta}>
                      <span className={s.stepFigmaBadge}>{step.step}</span>
                      {step.tab ? <span className={s.stepFigmaTab}>{step.tab}</span> : null}
                    </div>
                    <SoftTitle
                      id={`${step.id}-title`}
                      title={step.title}
                      className={s.stepFigmaTitle}
                    />
                    <div className={s.stepFigmaDesc}>
                      {step.description.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
