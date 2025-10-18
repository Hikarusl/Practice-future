import BaseComponent from './BaseComponent.js'
import MatchMedia from './MatchMedia.js'

const rootSelector = '[data-js-select]'

class Select extends BaseComponent {
  selectors = {
    root: rootSelector,
    originalControl: '[data-js-select-original]',
    button: '[data-js-select-button]',
    dropdown: '[data-js-select-dropdown]',
    option: '[data-js-select-option]',
  }

  stateClasses = {
    isExpanded: 'is-expanded',
    isSelected: 'is-selected',
    isCurrent: 'is-current',
    isOnTheLeftSide: 'is-on-the-left-side',
    isOnTheRightSide: 'is-on-the-right-side',
  }

  stateAttributes = {
    ariaExpanded: 'aria-expanded',
    ariaSelected: 'aria-selected',
    ariaActiveDescendant: 'aria-activedescendant',
  }

  initialState = {
    isExpanded: false,
    currentOptionIndex: null,
    selectedOptionElement: null,
  }

  constructor(rootElement) {
    super()
    this.rootElement = rootElement
    this.originalElement = this.rootElement.querySelector(
      this.selectors.originalControl,
    )
    this.buttonElement = this.rootElement.querySelector(this.selectors.button)
    this.dropdownElement = this.rootElement.querySelector(
      this.selectors.dropdown,
    )
    this.optionElements = this.rootElement.querySelectorAll(
      this.selectors.option,
    )
    this.state = this.getProxyState({
      ...this.initialState,
      currentOptionIndex: this.originalElement.selectedIndex,
      selectedOptionElement:
        this.optionElements[this.originalElement.selectedIndex],
    })
    this.fixDropdownPosition()
    this.updateTabIndexes()
    this.bindEvents()
  }

  updateUI() {
    const { isExpanded, currentOptionIndex, selectedOptionElement } = this.state
    const newSelectedValue = selectedOptionElement.textContent.trim()
    const updateOriginal = () => {
      this.originalElement.value = newSelectedValue
    }
    const updateButton = () => {
      this.buttonElement.textContent = newSelectedValue
      this.buttonElement.classList.toggle(
        this.stateClasses.isExpanded,
        isExpanded,
      )
      this.buttonElement.setAttribute(
        this.stateAttributes.ariaExpanded,
        isExpanded,
      )
      this.buttonElement.setAttribute(
        this.stateAttributes.ariaActiveDescendant,
        this.optionElements[currentOptionIndex].id,
      )
    }
    const updateDropdown = () => {
      this.dropdownElement.classList.toggle(
        this.stateClasses.isExpanded,
        isExpanded,
      )
    }
    const updateOptions = () => {
      this.optionElements.forEach((optionElement, index) => {
        const isCurrent = currentOptionIndex === index
        const isSelected = selectedOptionElement === optionElement

        optionElement.classList.toggle(this.stateClasses.isCurrent, isCurrent)
        optionElement.classList.toggle(this.stateClasses.isSelected, isSelected)

        optionElement.setAttribute(
          this.stateAttributes.ariaSelected,
          isSelected,
        )
      })
    }

    updateOriginal()
    updateButton()
    updateDropdown()
    updateOptions()
  }

  fixDropdownPosition() {
    const viewportWidth = document.documentElement.clientWidth
    const halfViewportX = viewportWidth / 2
    const { width, x } = this.buttonElement.getClientRects()
    const buttonCenterX = x + width / 2
    const isButtonOnLeft = buttonCenterX < halfViewportX

    this.dropdownElement.classList.toggle(
      this.stateClasses.isOnTheLeftSide,
      isButtonOnLeft,
    )

    this.dropdownElement.classList.toggle(
      this.stateClasses.isOnTheRightSide,
      !isButtonOnLeft,
    )
  }

  toggleExpandedState() {
    this.state.isExpanded = !this.state.isExpanded
  }
  expand() {
    this.state.isExpanded = true
  }
  collapse() {
    this.state.isExpanded = false
  }

  //Смена навигации через tabindex
  updateTabIndexes(isMobile = MatchMedia.mobile.matches) {
    this.originalElement.tabIndex = isMobile ? 0 : -1
    this.buttonElement.tabIndex = isMobile ? -1 : 0
  }
  onMobileMatchMediaChange = (e) => {
    this.updateTabIndexes(e.matches)
  }

  onButtonClick = (e) => {
    this.toggleExpandedState()
  }

  OnClick = (e) => {
    const target = e.target
    //Способы закрытия
    const isOutsideTarget =
      target.closest(this.selectors.dropdown) !== this.dropdownElement
    const isButtonClick = target === this.buttonElement

    if (!isButtonClick && isOutsideTarget) {
      this.collapse()
      return
    }

    //Обработка выбора опции
    const isOptionClick = target.matches(this.selectors.option)
    if (isOptionClick) {
      this.state.selectedOptionElement = target
      this.state.currentOptionIndex = [...this.optionElements].findIndex(
        (optionElement) => optionElement === target,
      )
      this.collapse()
    }
  }

  get isNeedToExpand() {
    const isButtonFocused = document.activeElement === this.buttonElement

    return !this.state.isExpanded && isButtonFocused
  }
  selectCurrentOption() {
    this.state.selectedOptionElement =
      this.optionElements[this.state.currentOptionIndex]
  }

  onArrowUpKeyDown = () => {
    if (this.isNeedToExpand) {
      this.expand()
      return
    }

    if (this.state.currentOptionIndex > 0) {
      this.state.currentOptionIndex--
    }
  }

  onArrowDownKeyDown = () => {
    if (this.isNeedToExpand) {
      this.expand()
      return
    }

    if (this.state.currentOptionIndex < this.optionElements.length - 1) {
      this.state.currentOptionIndex++
    }
  }

  onSpaceKeyDown = () => {
    if (this.isNeedToExpand) {
      this.expand()
      return
    }

    this.selectCurrentOption()
    this.collapse()
  }

  onEnterKeyDown = () => {
    if (this.isNeedToExpand) {
      this.expand()
      return
    }

    this.selectCurrentOption()
    this.collapse()
  }

  OnKeydown = (e) => {
    const { code } = e
    const action = {
      ArrowUp: this.onArrowUpKeyDown,
      ArrowDown: this.onArrowDownKeyDown,
      Space: this.onSpaceKeyDown,
      Enter: this.onEnterKeyDown,
    }[code]

    if (action) {
      e.preventDefault()
      action()
    }
  }
  onOriginalControlChange = () => {
    this.state.selectedOptionElement =
      this.optionElements[this.originalElement.selectedIndex]
  }

  bindEvents() {
    MatchMedia.mobile.addEventListener('change', this.onMobileMatchMediaChange)
    this.buttonElement.addEventListener('click', this.onButtonClick)
    document.addEventListener('click', this.OnClick)
    this.rootElement.addEventListener('keydown', this.OnKeydown)
    this.originalElement.addEventListener(
      'change',
      this.onOriginalControlChange,
    )
  }
}

class SelectCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new Select(element)
    })
  }
}

export default SelectCollection
