/**
 * jquery.slide.js v0.1.0
 * MIT License
 * author info pls visit: http://luopq.com
 * for more info pls visit: https://github.com/LuoPQ/jquery.slide.js
 */
; (function ($, window, document, undefined) {
    "use strict";

    var defaults = {
        "switchTime": 5000,
        "speed": 400,
        "perScrollCount": 1,
        "indexBoxSelector": ".indexBox",
        "btnLeftSelector": ".btnLeft",
        "btnRightSelector": ".btnRight",
        "indexClass": null,
        "bindHover": true,
        "onInit": null,
        "onBeforeChange": null,
        "onChanged": null,
        "delay": 0
    }


    var TOP_ZINDEX = 5;
    var DEFAULT_ZINDEX = 0;

    var directions = {
        left: "left",
        right: "right"
    };

    $.fn.exist = function () {
        return $(this).length;
    }

    function Slider($slider, options) {
        this.$slider = $slider;
        this.$sliderItems = $slider.children();
        this.$indexBtns = $(options.indexBoxSelector).children();

        this.options = options;


        // 默认的容器尺寸等于滚动项尺寸
        this.containerWidth = this.$sliderItems.first().outerWidth(true);

        this.containerHeight = this.$sliderItems.first().outerHeight(true);

        this.currentIndex = 0;
        this.minIndex = 0;
        this.maxIndex = this.$sliderItems.length - 1;

        this.timer = null;

        this.init();
        this.bindEvent();
        this.startTimer();
        this.options.onInit && this.options.onInit.call($slider.get(0));
    };
    Slider.prototype = {
        constructor: Slider,
        init: function () {
            var $slider = this.$slider;
            var $sliderItems = this.$sliderItems;
            var options = this.options;

            //如果一次性滚动多个，修改相关的的数据
            if (options.perScrollCount > 1) {
                for (var i = 0, length = $sliderItems.length; i < length; i = i + options.perScrollCount) {
                    $sliderItems.slice(i, i + options.perScrollCount).wrapAll("<div />");
                }
                this.$sliderItems = $slider.children();
                $sliderItems = this.$sliderItems;

                this.containerWidth = this.containerWidth * options.perScrollCount;
                this.maxIndex = $sliderItems.length - 1;
            }
            //在外层增加一个遮挡滚动列表的div
            $slider.wrap('<div style="overflow:hidden;position:relative;width:' + this.containerWidth + 'px;height:' + this.containerHeight + 'px" />');


            //设置图片列表为绝对定位，动画效果需要绝对定位,并且设置Slider的宽度
            $slider.css({
                "width": this.containerWidth * 2,
                "position": "absolute"
            });

            //设置图片绝对定位，使其重叠,实现无限滚动的效果
            $sliderItems.css({
                "position": "absolute",
                "width": this.containerWidth
            });

            //初始化图片的样式
            $sliderItems.first().css({
                zIndex: TOP_ZINDEX
            });
            $sliderItems.eq(1).css({
                left: this.containerWidth
            });
            $sliderItems.last().css({
                left: -this.containerWidth
            })
        },
        startTimer: function () {
            var that = this;
            that.timer = setInterval(function () {
                that.doSliding(directions.right);
            }, that.options.switchTime);
        },
        stopTimer: function () {
            clearInterval(this.timer);
        },
        doSliding: function (direction) {
            this.stopTimer();

            var currentIndex = this.currentIndex;

            this.options.onBeforeChange
                && this.options.onBeforeChange.call(this.$sliderItems.get(currentIndex), currentIndex);

            this.setCurrentIndex(direction, currentIndex);
            this.setCurrentIndexClass(currentIndex);

            var leftValue = direction === directions.left ? this.containerWidth : -this.containerWidth;
            this.move(leftValue);

            this.startTimer();
        },
        setCurrentIndex: function (direction, currentIndex) {
            var minIndex = this.minIndex;
            var maxIndex = this.maxIndex;

            switch (direction) {
                case directions.left:
                    this.currentIndex = currentIndex === minIndex ? maxIndex : currentIndex - 1;
                    break;
                case directions.right:
                    this.currentIndex = currentIndex === maxIndex ? minIndex : currentIndex + 1;
                    break;
                default:
            }
        },
        setCurrentIndexClass: function (currentIndex) {
            this.$indexBtns.exist() &&
            this.$indexBtns.eq(currentIndex).addClass(this.options.indexClass)
                  .siblings().removeClass(this.options.indexClass);
        },
        move: function (leftValue) {
            var that = this;

            var $slider = that.$slider;
            var $sliderItems = this.$sliderItems;

            var currentIndex = that.currentIndex;
            var minIndex = that.minIndex;
            var maxIndex = that.maxIndex;
            var width = that.containerWidth;

            setTimeout(function () {
                $slider.stop(true, true).animate({ "left": leftValue }, that.options.speed, "linear", function () {
                    $slider.css({ "left": "0px" });

                    $sliderItems.css({
                        left: "0px",
                        zIndex: DEFAULT_ZINDEX
                    })

                    $sliderItems.eq(currentIndex).css({
                        zIndex: TOP_ZINDEX,
                    });

                    //设置前后索引的样式保证动画效果能够同一方向无限滚动
                    //设置当前索引的前一项的left
                    $sliderItems.eq(currentIndex - 1 < minIndex ? maxIndex : currentIndex - 1).css({
                        left: -width
                    });

                    //设置当前索引的后一项的left
                    $sliderItems.eq(currentIndex + 1 > maxIndex ? minIndex : currentIndex + 1).css({
                        left: width
                    });

                    that.options.onChanged && that.options.onChanged.call($sliderItems.get(currentIndex), currentIndex);
                });
            }, that.options.delay);

        },
        bindEvent: function () {
            var that = this;
            if (that.options.bindHover) {
                that.$slider.hover(function () {
                    that.stopTimer();
                }, function () {
                    that.startTimer();
                });
            }

            var $btnLeft = $(that.options.btnLeftSelector);
            var $btnRight = $(that.options.btnRightSelector);
            $btnLeft.exist() && $btnLeft.on("click", function () {
                that.doSliding(directions.left);
            })
            $btnRight.exist() && $btnRight.on("click", function () {
                that.doSliding(directions.right);
            })


            that.$indexBtns.exist() &&
            that.$indexBtns.hover(function () {
                var index = $(this).index();
                if (index != that.currentIndex) {

                    that.options.onBeforeChange && that.options.onBeforeChange.call(that.$sliderItems.get(0), that.currentIndex);

                    var leftValue = index - that.currentIndex < 0 ? that.containerWidth : -that.containerWidth;
                    that.currentIndex = index;

                    that.move(leftValue);
                    that.setCurrentIndexClass(that.currentIndex);
                }
                that.stopTimer();
            }, function () {
                that.startTimer();
            });
        }
    };

    $.fn.slide = function (options) {
        options = $.extend(defaults, options || {});

        var slider = new Slider($(this), options);

        return {
            start: function () {
                slider.startTimer();
                return this;
            },
            stop: function () {
                slider.stopTimer();
                return this;
            }
        }
    }

})($, window, document);