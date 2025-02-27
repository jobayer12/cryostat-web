/*
 * Copyright The Cryostat Authors
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any
 * person obtaining a copy of this software, associated documentation and/or data
 * (collectively the "Software"), free of charge and under any and all copyright
 * rights in the Software, and any and all patent rights owned or freely
 * licensable by each licensor hereunder covering either (i) the unmodified
 * Software as contributed to or provided by such licensor, or (ii) the Larger
 * Works (as defined below), to deal in both
 *
 * (a) the Software, and
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if
 * one is included with the Software (each a "Larger Work" to which the Software
 * is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create
 * derivative works of, display, perform, and distribute the Software and make,
 * use, sell, offer for sale, import, export, have made, and have sold the
 * Software and the Larger Work(s), and to sublicense the foregoing rights on
 * either these or other terms.
 *
 * This license is subject to the following condition:
 * The above copyright notice and either this complete permission notice or at
 * a minimum a reference to the UPL must be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { dashboardConfigAddCardIntent, StateDispatch } from '@app/Shared/Redux/ReduxStore';
import { ServiceContext } from '@app/Shared/Services/Services';
import { EmptyText } from '@app/Topology/Shared/EmptyText';
import QuickSearchIcon from '@app/Topology/Shared/QuickSearchIcon';
import { fakeChartContext, fakeServices } from '@app/utils/fakeData';
import { useFeatureLevel } from '@app/utils/useFeatureLevel';
import { useSubscriptions } from '@app/utils/useSubscriptions';
import { portalRoot } from '@app/utils/utils';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  Level,
  LevelItem,
  Modal,
  NumberInput,
  Select,
  SelectOption,
  SelectOptionObject,
  Stack,
  StackItem,
  Switch,
  Text,
  TextArea,
  TextInput,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  CustomWizardNavFunction,
  Wizard,
  WizardControlStep,
  WizardHeader,
  WizardNav,
  WizardNavItem,
  WizardStep,
} from '@patternfly/react-core/dist/js/next';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { TFunction } from 'i18next';
import { nanoid } from 'nanoid';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Observable, of } from 'rxjs';
import { ChartContext } from './Charts/ChartContext';
import {
  getCardDescriptorByTitle,
  getDashboardCards,
  CardConfig,
  DashboardCardDescriptor,
  PropControl,
} from './dashboard-utils';

interface AddCardProps {
  variant: 'card' | 'icon-button';
}

export const AddCard: React.FC<AddCardProps> = ({ variant, ..._props }) => {
  const dispatch = useDispatch<StateDispatch>();
  const { t } = useTranslation();

  const [showWizard, setShowWizard] = React.useState(false);
  const [selection, setSelection] = React.useState('');
  const [propsConfig, setPropsConfig] = React.useState({});

  const catalogRef = React.useRef<HTMLDivElement>(null);

  const handleSelect = React.useCallback(
    (_: React.MouseEvent, selection: string) => {
      setSelection(selection);
      const c = {};
      if (selection) {
        getCardDescriptorByTitle(selection, t).propControls.forEach((ctrl) => (c[ctrl.key] = ctrl.defaultValue));
      }
      setPropsConfig(c);
    },
    [t, setSelection, setPropsConfig]
  );

  const handleAdd = React.useCallback(() => {
    setShowWizard(false);
    const config = getCardDescriptorByTitle(selection, t);
    const cardConfig: CardConfig = {
      id: `${config.component.name}-${nanoid()}`,
      name: config.component.name,
      span: config.cardSizes.span.default,
      props: propsConfig,
    };
    dispatch(dashboardConfigAddCardIntent(cardConfig.id, cardConfig.name, cardConfig.span, cardConfig.props));
  }, [dispatch, t, setShowWizard, selection, propsConfig]);

  const handleStart = React.useCallback(() => {
    setShowWizard(true);
    catalogRef.current?.blur();
  }, [setShowWizard]);

  const handleStop = React.useCallback(() => {
    setShowWizard(false);
    setSelection('');
    setPropsConfig({});
  }, [setSelection, setShowWizard, setPropsConfig]);

  // custom nav for disabling subsequent steps (ex. configuration) if a card type hasn't been selected first
  const customNav: CustomWizardNavFunction = React.useCallback(
    (
      isExpanded: boolean,
      steps: WizardControlStep[],
      activeStep: WizardControlStep,
      goToStepByIndex: (index: number) => void
    ) => {
      return (
        <WizardNav isExpanded={isExpanded}>
          {steps
            .filter((step) => !step.isHidden)
            .map((step, idx) => (
              <WizardNavItem
                key={step.id}
                id={step.id}
                content={step.name}
                isCurrent={activeStep.id === step.id}
                isDisabled={step.isDisabled || (idx > 0 && !selection)}
                stepIndex={step.index}
                onNavItemClick={goToStepByIndex}
              />
            ))}
        </WizardNav>
      );
    },
    [selection]
  );

  const content = React.useMemo(() => {
    switch (variant) {
      case 'card':
        return (
          <Card isRounded isCompact isFullHeight>
            <CardBody>
              <Bullseye>
                <EmptyState variant={EmptyStateVariant.large}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="md">
                    Add a new card
                  </Title>
                  <EmptyStateBody>{t('Dashboard.CARD_CATALOG_DESCRIPTION')}</EmptyStateBody>
                  <Button variant="primary" onClick={handleStart} data-quickstart-id="dashboard-add-btn">
                    Add
                  </Button>
                </EmptyState>
              </Bullseye>
            </CardBody>
          </Card>
        );
      case 'icon-button':
        return (
          <Tooltip
            content={'Add card'}
            appendTo={() => document.getElementById('dashboard-catalog-btn-wrapper') || document.body}
          >
            <Button
              aria-label="Add card"
              data-quickstart-id={'dashboard-add-btn'}
              variant="plain"
              onClick={handleStart}
              style={{ padding: 0 }}
              ref={catalogRef}
            >
              <QuickSearchIcon />
            </Button>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [handleStart, t, variant]);

  return (
    <>
      <div id="dashboard-catalog-btn-wrapper">{content}</div>
      <Modal
        aria-label="Dashboard Card Catalog Modal"
        isOpen={showWizard}
        width={'90%'}
        className="card-catalog__wizard-modal"
        hasNoBodyWrapper
        showClose={false}
        appendTo={portalRoot}
      >
        <Wizard
          id={'card-catalog-wizard'}
          onClose={handleStop}
          onSave={handleAdd}
          nav={customNav}
          header={
            <WizardHeader
              title={t('Dashboard.CARD_CATALOG_TITLE')}
              onClose={handleStop}
              closeButtonAriaLabel="Close add card form"
              description={t('Dashboard.CARD_CATALOG_DESCRIPTION')}
            />
          }
        >
          <WizardStep
            id="card-type-select"
            name={t('CARD_TYPE', { ns: 'common' })}
            footer={{
              isNextDisabled: !selection,
              nextButtonText:
                selection &&
                !getCardDescriptorByTitle(selection, t).propControls.length &&
                !getCardDescriptorByTitle(selection, t).advancedConfig
                  ? 'Finish'
                  : 'Next',
            }}
          >
            <Stack>
              <StackItem>
                <Text>{t('Dashboard.ADD_CARD_HELPER_TEXT')}</Text>
              </StackItem>
              <StackItem isFilled style={{ overflow: 'auto' }}>
                <CardGallery selection={selection} onSelect={handleSelect} />
              </StackItem>
            </Stack>
          </WizardStep>
          <WizardStep
            id="card-props-config"
            name="Configuration"
            footer={{
              nextButtonText: selection && !getCardDescriptorByTitle(selection, t).advancedConfig ? 'Finish' : 'Next',
            }}
            isHidden={!selection || !getCardDescriptorByTitle(selection, t).propControls.length}
          >
            {selection && (
              <PropsConfigForm
                cardTitle={selection}
                config={propsConfig}
                controls={getCardDescriptorByTitle(selection, t).propControls}
                onChange={setPropsConfig}
              />
            )}
          </WizardStep>
          <WizardStep
            id="card-adv-config"
            name="Advanced Configuration"
            footer={{ nextButtonText: 'Finish' }}
            isHidden={!selection || !getCardDescriptorByTitle(selection, t).advancedConfig}
          >
            <Title headingLevel="h5">Provide advanced configuration for the {selection} card</Title>
            {selection && getCardDescriptorByTitle(selection, t).advancedConfig}
          </WizardStep>
        </Wizard>
      </Modal>
    </>
  );
};

const getFullDescription = (selection: string, t: TFunction) => {
  const config = getCardDescriptorByTitle(selection, t).descriptionFull;
  if (typeof config === 'string') {
    return t(config);
  } else {
    return config;
  }
};

export interface CardGalleryProps {
  selection: string; // Translated card title
  onSelect: (event: React.MouseEvent, selection: string) => void;
}

export const CardGallery: React.FC<CardGalleryProps> = ({ selection, onSelect }) => {
  const { t } = useTranslation();
  const activeLevel = useFeatureLevel();
  const [toViewCard, setToViewCard] = React.useState<DashboardCardDescriptor>();

  const availableCards = React.useMemo(() => getDashboardCards(activeLevel), [activeLevel]);

  const items = React.useMemo(() => {
    return availableCards.map((card) => {
      const { icon, labels, title, description } = card;
      return (
        <Card
          id={title}
          key={title}
          hasSelectableInput
          isSelectableRaised
          onClick={(event) => {
            if (selection === t(title)) {
              setToViewCard(availableCards.find((card) => t(card.title) === selection));
            } else {
              onSelect(event, t(title));
            }
          }}
          isFullHeight
          isFlat
          isSelected={selection === t(title)}
        >
          <CardHeader>
            <Level hasGutter>
              {icon ? <LevelItem>{icon}</LevelItem> : null}
              <LevelItem>
                <CardTitle>{t(title)}</CardTitle>
              </LevelItem>
              <LevelItem>
                {labels ? (
                  <LabelGroup>
                    {labels.map(({ content, icon, color }) => (
                      <Label key={content} color={color} icon={icon} isCompact>
                        {content}
                      </Label>
                    ))}
                  </LabelGroup>
                ) : null}
              </LevelItem>
            </Level>
          </CardHeader>
          <CardBody>{t(description)}</CardBody>
        </Card>
      );
    });
  }, [t, availableCards, selection, onSelect]);

  React.useEffect(() => {
    setToViewCard(availableCards.find((card) => t(card.title) === selection));
  }, [selection, availableCards, t]);

  const panelContent = React.useMemo(() => {
    if (!toViewCard) {
      return null;
    }
    const { title, icon, labels, preview } = toViewCard;
    return (
      <DrawerPanelContent isResizable defaultSize="50%">
        <DrawerHead>
          <DrawerActions>
            <DrawerCloseButton onClick={() => setToViewCard(undefined)} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody className="card-catalog__detail-panel-body">
          <Stack hasGutter>
            <StackItem>
              <Flex spacer={{ default: 'spacerSm' }}>
                {icon ? <FlexItem>{icon}</FlexItem> : null}
                <FlexItem>
                  <Title headingLevel={'h3'}>{t(title)}</Title>
                </FlexItem>
              </Flex>
            </StackItem>
            <StackItem>
              {labels && labels.length ? (
                <LabelGroup>
                  {labels.map(({ content, icon, color }) => (
                    <Label key={content} color={color} icon={icon}>
                      {content}
                    </Label>
                  ))}
                </LabelGroup>
              ) : null}
            </StackItem>
            <StackItem>{getFullDescription(t(title), t)}</StackItem>
            <StackItem isFilled>
              {preview ? (
                <div className="dashboard-card-preview">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="non-interactive-overlay"
                  />
                  <ServiceContext.Provider value={fakeServices}>
                    <ChartContext.Provider value={fakeChartContext}>{preview}</ChartContext.Provider>
                  </ServiceContext.Provider>
                </div>
              ) : (
                <Bullseye>
                  <EmptyText text={'No preview'} />
                </Bullseye>
              )}
            </StackItem>
          </Stack>
        </DrawerPanelBody>
      </DrawerPanelContent>
    );
  }, [t, setToViewCard, toViewCard]);

  return (
    <Drawer isExpanded={!!toViewCard} isInline>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <Grid hasGutter style={{ alignItems: 'stretch', marginTop: '1em', marginRight: !toViewCard ? 0 : '1em' }}>
            {items.map((item) => (
              <GridItem span={4} key={item.key}>
                {item}
              </GridItem>
            ))}
          </Grid>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

interface PropsConfigFormProps {
  cardTitle: string;
  controls: PropControl[];
  config: object;
  onChange: (config: object) => void;
}

const PropsConfigForm: React.FC<PropsConfigFormProps> = ({ onChange, ...props }) => {
  const { t } = useTranslation();
  const handleChange = React.useCallback(
    (k: string) => (e: unknown) => {
      const copy = { ...props.config };
      copy[k] = e;
      onChange(copy);
    },
    [onChange, props.config]
  );

  const handleNumeric = React.useCallback(
    (k: string) => (e: React.FormEvent<HTMLInputElement>) => {
      const value = (e.target as HTMLInputElement).value;
      const copy = { ...props.config };
      copy[k] = value;
      onChange(copy);
    },
    [onChange, props.config]
  );

  const handleNumericStep = React.useCallback(
    (k: string, v: number) => (_: React.MouseEvent) => {
      const copy = { ...props.config };
      copy[k] = props.config[k] + v;
      onChange(copy);
    },
    [onChange, props.config]
  );

  const createControl = React.useCallback(
    (ctrl: PropControl): JSX.Element => {
      let input: JSX.Element;
      switch (ctrl.kind) {
        case 'boolean':
          input = (
            <Switch label="On" labelOff="Off" isChecked={props.config[ctrl.key]} onChange={handleChange(ctrl.key)} />
          );
          break;
        case 'number':
          input = (
            <NumberInput
              inputName={t(ctrl.name)}
              inputAriaLabel={`${t(ctrl.name)} input`}
              value={props.config[ctrl.key]}
              onChange={handleNumeric(ctrl.key)}
              onPlus={handleNumericStep(ctrl.key, 1)}
              onMinus={handleNumericStep(ctrl.key, -1)}
              min={ctrl.extras?.min}
              max={ctrl.extras?.max}
            />
          );
          break;
        case 'string':
          input = (
            <TextInput
              type="text"
              aria-label={`${ctrl.key} input`}
              value={props.config[ctrl.key]}
              onChange={handleChange(ctrl.key)}
            />
          );
          break;
        case 'text':
          input = (
            <TextArea
              type="text"
              aria-label={`${ctrl.key} input`}
              value={props.config[ctrl.key]}
              onChange={handleChange(ctrl.key)}
            />
          );
          break;
        case 'select':
          input = (
            <SelectControl
              handleChange={handleChange(ctrl.key)}
              selectedConfig={props.config[ctrl.key]}
              control={ctrl}
            />
          );
          break;
        default:
          input = <Text>Bad config</Text>;
          break;
      }
      return (
        <FormGroup key={`${ctrl.key}`} label={t(ctrl.name)} helperText={t(ctrl.description)} isInline isStack>
          {input}
        </FormGroup>
      );
    },
    [t, props.config, handleChange, handleNumeric, handleNumericStep]
  );

  return (
    <>
      {props.controls.length > 0 ? (
        <Form>
          <Title headingLevel={'h5'}>Configure the {props.cardTitle} card</Title>
          {props.controls.map((ctrl) => createControl(ctrl))}
        </Form>
      ) : (
        <Text>No configuration required.</Text>
      )}
    </>
  );
};

interface SelectControlProps {
  handleChange: (selection: string) => void;
  control: PropControl;
  selectedConfig: string | SelectOptionObject;
}

const SelectControl: React.FC<SelectControlProps> = ({ handleChange, control, selectedConfig }) => {
  const addSubscription = useSubscriptions();

  const [selectOpen, setSelectOpen] = React.useState(false);
  const [options, setOptions] = React.useState<string[]>([]);
  const [errored, setErrored] = React.useState(false);

  const handleSelect = React.useCallback(
    (_, selection, isPlaceholder) => {
      if (!isPlaceholder) {
        handleChange(selection);
      }
      setSelectOpen(false);
    },
    [handleChange, setSelectOpen]
  );

  React.useEffect(() => {
    let obs;
    if (control.values instanceof Observable) {
      obs = control.values;
    } else {
      obs = of(control.values);
    }
    addSubscription(
      obs.subscribe({
        next: (v) => {
          setErrored(false);
          setOptions((old) => {
            if (Array.isArray(v)) {
              return v.map((s) => String(s));
            }
            return [...old, String(v)];
          });
        },
        error: (err) => {
          setErrored(true);
          setOptions([`${err}`]);
        },
      })
    );
  }, [addSubscription, setOptions, setErrored, control, control.values]);

  return (
    <Select
      onToggle={setSelectOpen}
      isOpen={selectOpen}
      onSelect={handleSelect}
      selections={selectedConfig}
      menuAppendTo={portalRoot}
      isFlipEnabled
      maxHeight={'16em'}
    >
      {errored
        ? [<SelectOption key={0} value={`Load Error: ${options[0]}`} isPlaceholder isDisabled />]
        : options.map((choice, idx) => {
            const display =
              control.extras && control.extras.displayMapper ? control.extras.displayMapper(choice) : choice;
            return (
              <SelectOption key={idx + 1} value={choice}>
                {display}
              </SelectOption>
            );
          })}
    </Select>
  );
};
