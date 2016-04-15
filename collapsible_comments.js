(function ($) {
  // Theme function for the show/hide links
  // Make sure to keep a.comment-thread-expand if you override this theme function
  Drupal.theme.prototype.commentCollapseLink = function(text) {
    return '<a href="#" class="comment-thread-expand">'+ Drupal.t(text) +'</a>';
  }

  // Drupal behaviour for collapsing indented comments.
  Drupal.behaviors.collapsibleComments = {
    attach: function (context, settings) {
      // Cache selections and return early if appropiate.
      var $comments = $('#comments:not(.collapsible-comments-processed)').addClass('collapsible-comments-processed');
      // If we didn't find #comments, this might be a panel view.
      if ($comments.size() < 1) { 
        $comments = $('.pane-node-comments:not(.collapsible-comments-processed) .pane-content').addClass('collapsible-comments-processed');
      }
      if ($comments.size() < 1) return;
      var $indented = $comments.find('> .indented');
      if ($indented.size() < 1) return;

      // Our settings.
      var level = settings.collapsible_comments.level;
      var mode = settings.collapsible_comments.mode;
      var effect = settings.collapsible_comments.effect;

      var button = Drupal.theme('commentCollapseLink', 'Show responses');

      // 1. Find the appropiate indentation level
      $toProcess = collapsibleCommentsGetLevel(level, $comments, mode);
      // 2. Execute the proper setup depending on mode
      collapsibleCommentsEnable($toProcess, button, mode, level)

      // 3. Bind our behaviour to the click event
      $('.comment-thread-expand', $comments).click(function(){
        var $this = $(this);
        var $parent = $this.parent();
        var $toToggle = $parent.next('.indented');
        var text = ($this.text() == Drupal.t('Hide responses')) ? Drupal.t('Show responses') : Drupal.t('Hide responses');
        $this.text(text);

        if (effect == 'slide') {
          $toToggle.slideToggle();
        }

        else if (effect == 'hide') {
          $toToggle.toggle();
        }

        $parent.toggleClass('indented-hidden');

        return false;
      }); // End click event

      /**
       * Helper function to enable a collasible comment thread.
       */
      function collapsibleCommentsEnable(element, button, mode, level) {
        element.hide();
        element.prev().append(button).addClass('indented-hidden collaspsible-comments-enabled');
        if (mode == 0) return;

        if (mode == 1 && level > 0) {
          // handle all children indented independently
          var $subIndent =  $('.indented', element);
          var num = $subIndent.size();
          if (num < 1) return;

          $subIndent.each(function(){
            var $this = $(this);
            $this.hide();
            $this.prev().append(button).addClass('indented-hidden collaspsible-comments-enabled');
          });
        } // End mode 1
      }

      /**
       * Helper function to select the appropiate level of indentation
       */
      function collapsibleCommentsGetLevel(level, comments, mode){
        var currentLevel = 0;
        // Comment indentation levels displayed NONE requires special handling.
        if (level == 0) {
          // as a  block
          if (mode == 0) {
            // only the indented parent comments without child indented comments
            return $('.indented', comments).filter(function() {
              var $this = $(this);
              var $children = $this.children();
              // Without any children.
              if ($children.size() == 0) {
                if ($this.parent().is('.indented')){ return false; }
                else { return true; }
              }
              // With indented children.
              else if ($children.is('.indented')) {
                if ($this.parent().is(':not(.indented)')){ return true; }
                return false;
              }
              return true;
            });
          }
          if (mode == 1){
            return $('.indented', comments);
          }
        }

        // This handles the rest of Comment indentation levels displayed options
        var $selection = $('> .indented', comments);
        while (currentLevel < level) {
          $selection = $('> .indented', $selection);
          currentLevel++;
        }
        return $selection;
      }

    } // End attach
  } // End behavior collapsibleComments
})(jQuery);
