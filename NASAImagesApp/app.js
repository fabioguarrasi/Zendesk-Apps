(function(){

  return {
    appID:  'nasa_calendar_widget',
    defaultState: 'widget',
    selectedDate: null,
    imageURL: '',
    errorImg: '',
    rootNode: null,
    events: {
      'app.activated': 'init',
      'click .thumbnail img': 'openModal',
      'click .modal': 'closeModal',
      'click .modal img': 'stopClickPropagation',
    },

    init: function() {
      var self = this;
      this.rootNode = this.$domEl[0].element;
      if(!this.selectedDate) {
        this.selectedDate = this.getFormattedDate();
      }
      this.getNasaImage(false, this.selectedDate)
      .then(function(data) {
        if(data && data.error) {
          self.errorImg = data.error;
        } else {
          self.imageURL = data.url;
        }
        self.setThumbnail(data);
        self.initDatePicker();
      });
    },

    /*
     * request NASA api to get the related image
     * @param {Boolean} requestHD
     * @param {String} date
     * @return {Promise(Object)}
     */
    getNasaImage: function(requestHD, date) {
      return this.promise(function(resolve, reject) {
        var NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
        var NASA_API_KEY = '8tKXFJvk4bzxmNizdRyj62p8ouqTEIo4LCoJO7FP';
        var url = NASA_API_URL +'?api_key='+ NASA_API_KEY +'&hd='+ requestHD +'&date='+ date;
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onreadystatechange = function() {
          if(this.readyState === 4) {
            var response = JSON.parse(this.responseText);
            var data;
            if(this.status === 200) {
              data = {
                url: requestHD ? response.hdurl : response.url
              };
              resolve(data);
            } else {
              data = {
                error : response.status +': '+ response.statusText
              };
              reject(data);
            }
          }
        };
        request.send();
      });
    },

    /*
     * Format the date as requested by NASA api
     * @param {String || null} date
     * @return {String}
     *
     */
    getFormattedDate: function(date) {
      var _date = date ? new Date(date) : new Date();
      return _date.toISOString().split('T')[0];
    },

    /*
     * Set the url for the thumbnail image. If an error occurrend
     * during the ajax request, an error will be showed
     *
     */
    setThumbnail: function(data) {
      var imageNode = this.rootNode.querySelector('.thumbnail img');
      var errorNode = this.rootNode.querySelector('.thumbnail img');
      if(data.error) {
        errorNode.value = data.error;
        errorNode.classList.add('show');
        imageNode.classList.remove('show');
        imageNode.setAttribute('src', '');
      } else {
        errorNode.value = '';
        errorNode.classList.remove('show');
        imageNode.setAttribute('src', data.url);
        imageNode.classList.add('show');
      }
    },

    /*
     * Open the modal to show the selected image. The url has been passed.
     *
     */
    openModal: function() {
      var modalImg = this.rootNode.querySelector('#imageModal img');
      modalImg.setAttribute('src', this.imageURL);
      this.rootNode.querySelector('#imageModal').classList.add('show');
    },

    /*
     * Close the modal switching to the widget view.
     *
     */
    closeModal: function() {
      this.rootNode.querySelector('#imageModal').classList.remove('show');
    },

    /*
     * Avoid closing the modal when the image is clicked
     *
     */
    stopClickPropagation: function(e) {
      e.stopPropagation();
    },

    /*
     * Init datepicker and request TODAY image from NASA api
     *
     */
    initDatePicker: function() {
      var self = this;
      this.$('.datepicker').datepicker({
        maxDate: 'Now',
        prevText: '\u25c0',
        nextText: '\u25b6',
        onSelect: function(dateText, inst) {
          this.selectedDate = self.getFormattedDate(dateText);
          self.getNasaImage(false, this.selectedDate).then(function(data) {
            if(data && data.error) {
              self.errorImg = data.error;
            } else {
              self.imageURL = data.url;
            }
            self.setThumbnail(data);
          });
        }
      });
    }
  };
}());
