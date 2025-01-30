# coding: utf-8
"""
    Kubernetes

    No description provided (generated by Swagger Codegen
    https://github.com/swagger-api/swagger-codegen)

    OpenAPI spec version: v1.14.4

    Generated by: https://github.com/swagger-api/swagger-codegen.git
"""

from pprint import pformat
from six import iteritems
import re


class V1beta1CertificateSigningRequestSpec(object):
  """
    NOTE: This class is auto generated by the swagger code generator program.
    Do not edit the class manually.
    """
  """
    Attributes:
      swagger_types (dict): The key is attribute name and the value is attribute
        type.
      attribute_map (dict): The key is attribute name and the value is json key
        in definition.
  """
  swagger_types = {
      'extra': 'dict(str, list[str])',
      'groups': 'list[str]',
      'request': 'str',
      'uid': 'str',
      'usages': 'list[str]',
      'username': 'str'
  }

  attribute_map = {
      'extra': 'extra',
      'groups': 'groups',
      'request': 'request',
      'uid': 'uid',
      'usages': 'usages',
      'username': 'username'
  }

  def __init__(self,
               extra=None,
               groups=None,
               request=None,
               uid=None,
               usages=None,
               username=None):
    """
        V1beta1CertificateSigningRequestSpec - a model defined in Swagger
        """

    self._extra = None
    self._groups = None
    self._request = None
    self._uid = None
    self._usages = None
    self._username = None
    self.discriminator = None

    if extra is not None:
      self.extra = extra
    if groups is not None:
      self.groups = groups
    self.request = request
    if uid is not None:
      self.uid = uid
    if usages is not None:
      self.usages = usages
    if username is not None:
      self.username = username

  @property
  def extra(self):
    """
        Gets the extra of this V1beta1CertificateSigningRequestSpec.
        Extra information about the requesting user. See user.Info interface for
        details.

        :return: The extra of this V1beta1CertificateSigningRequestSpec.
        :rtype: dict(str, list[str])
        """
    return self._extra

  @extra.setter
  def extra(self, extra):
    """
        Sets the extra of this V1beta1CertificateSigningRequestSpec.
        Extra information about the requesting user. See user.Info interface for
        details.

        :param extra: The extra of this V1beta1CertificateSigningRequestSpec.
        :type: dict(str, list[str])
        """

    self._extra = extra

  @property
  def groups(self):
    """
        Gets the groups of this V1beta1CertificateSigningRequestSpec.
        Group information about the requesting user. See user.Info interface for
        details.

        :return: The groups of this V1beta1CertificateSigningRequestSpec.
        :rtype: list[str]
        """
    return self._groups

  @groups.setter
  def groups(self, groups):
    """
        Sets the groups of this V1beta1CertificateSigningRequestSpec.
        Group information about the requesting user. See user.Info interface for
        details.

        :param groups: The groups of this V1beta1CertificateSigningRequestSpec.
        :type: list[str]
        """

    self._groups = groups

  @property
  def request(self):
    """
        Gets the request of this V1beta1CertificateSigningRequestSpec.
        Base64-encoded PKCS#10 CSR data

        :return: The request of this V1beta1CertificateSigningRequestSpec.
        :rtype: str
        """
    return self._request

  @request.setter
  def request(self, request):
    """
        Sets the request of this V1beta1CertificateSigningRequestSpec.
        Base64-encoded PKCS#10 CSR data

        :param request: The request of this
        V1beta1CertificateSigningRequestSpec.
        :type: str
        """
    if request is None:
      raise ValueError('Invalid value for `request`, must not be `None`')
    if request is not None and not re.search(
        r'^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$',
        request):
      raise ValueError(
          'Invalid value for `request`, must be a follow pattern or equal to r`/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/`'
      )

    self._request = request

  @property
  def uid(self):
    """
        Gets the uid of this V1beta1CertificateSigningRequestSpec.
        UID information about the requesting user. See user.Info interface for
        details.

        :return: The uid of this V1beta1CertificateSigningRequestSpec.
        :rtype: str
        """
    return self._uid

  @uid.setter
  def uid(self, uid):
    """
        Sets the uid of this V1beta1CertificateSigningRequestSpec.
        UID information about the requesting user. See user.Info interface for
        details.

        :param uid: The uid of this V1beta1CertificateSigningRequestSpec.
        :type: str
        """

    self._uid = uid

  @property
  def usages(self):
    """
        Gets the usages of this V1beta1CertificateSigningRequestSpec.
        allowedUsages specifies a set of usage contexts the key will be valid
        for. See: https://tools.ietf.org/html/rfc5280#section-4.2.1.3
        https://tools.ietf.org/html/rfc5280#section-4.2.1.12

        :return: The usages of this V1beta1CertificateSigningRequestSpec.
        :rtype: list[str]
        """
    return self._usages

  @usages.setter
  def usages(self, usages):
    """
        Sets the usages of this V1beta1CertificateSigningRequestSpec.
        allowedUsages specifies a set of usage contexts the key will be valid
        for. See: https://tools.ietf.org/html/rfc5280#section-4.2.1.3
        https://tools.ietf.org/html/rfc5280#section-4.2.1.12

        :param usages: The usages of this V1beta1CertificateSigningRequestSpec.
        :type: list[str]
        """

    self._usages = usages

  @property
  def username(self):
    """
        Gets the username of this V1beta1CertificateSigningRequestSpec.
        Information about the requesting user. See user.Info interface for
        details.

        :return: The username of this V1beta1CertificateSigningRequestSpec.
        :rtype: str
        """
    return self._username

  @username.setter
  def username(self, username):
    """
        Sets the username of this V1beta1CertificateSigningRequestSpec.
        Information about the requesting user. See user.Info interface for
        details.

        :param username: The username of this
        V1beta1CertificateSigningRequestSpec.
        :type: str
        """

    self._username = username

  def to_dict(self):
    """
        Returns the model properties as a dict
        """
    result = {}

    for attr, _ in iteritems(self.swagger_types):
      value = getattr(self, attr)
      if isinstance(value, list):
        result[attr] = list(
            map(lambda x: x.to_dict() if hasattr(x, 'to_dict') else x, value))
      elif hasattr(value, 'to_dict'):
        result[attr] = value.to_dict()
      elif isinstance(value, dict):
        result[attr] = dict(
            map(
                lambda item: (item[0], item[1].to_dict())
                if hasattr(item[1], 'to_dict') else item, value.items()))
      else:
        result[attr] = value

    return result

  def to_str(self):
    """
        Returns the string representation of the model
        """
    return pformat(self.to_dict())

  def __repr__(self):
    """
        For `print` and `pprint`
        """
    return self.to_str()

  def __eq__(self, other):
    """
        Returns true if both objects are equal
        """
    if not isinstance(other, V1beta1CertificateSigningRequestSpec):
      return False

    return self.__dict__ == other.__dict__

  def __ne__(self, other):
    """
        Returns true if both objects are not equal
        """
    return not self == other
